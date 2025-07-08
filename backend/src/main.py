from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import jwt
import datetime
import os
from functools import wraps

app = Flask(__name__)
CORS(app, origins="*")

# Configuration
app.config['SECRET_KEY'] = 'aapli-shala-secret-key-2024'
DATABASE = 'aapli_shala.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    
    # Schools table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS schools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            udise_code TEXT UNIQUE NOT NULL,
            address TEXT NOT NULL,
            pin_code TEXT NOT NULL,
            phone TEXT,
            principal_name TEXT NOT NULL,
            principal_mobile TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Users table (principals and teachers)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('principal', 'teacher')),
            subject TEXT,
            class_assigned TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools (id)
        )
    ''')
    
    # Students table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER,
            name TEXT NOT NULL,
            class TEXT NOT NULL,
            roll_number TEXT NOT NULL,
            father_name TEXT,
            mother_name TEXT,
            address TEXT,
            mobile TEXT,
            date_of_birth DATE,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools (id)
        )
    ''')
    
    # Attendance table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER,
            student_id INTEGER,
            teacher_id INTEGER,
            date DATE NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools (id),
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (teacher_id) REFERENCES users (id)
        )
    ''')
    
    # Homework table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS homework (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER,
            teacher_id INTEGER,
            class TEXT NOT NULL,
            subject TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools (id),
            FOREIGN KEY (teacher_id) REFERENCES users (id)
        )
    ''')
    
    # Notices table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER,
            created_by INTEGER,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'teachers', 'students')),
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools (id),
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')
    
    # Calendar events table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS calendar_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER,
            created_by INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            event_date DATE NOT NULL,
            event_type TEXT NOT NULL CHECK (event_type IN ('holiday', 'exam', 'meeting', 'event')),
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools (id),
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    """Verify password against hash"""
    return hash_password(password) == password_hash

def generate_token(user_data):
    """Generate JWT token"""
    payload = {
        'user_id': user_data['id'],
        'mobile': user_data['mobile'],
        'role': user_data['role'],
        'school_id': user_data['school_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Aapli Shala API is running'})

@app.route('/api/school/setup', methods=['POST'])
def setup_school():
    """Setup school initial data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['schoolName', 'udiseCode', 'schoolAddress', 'pinCode', 'principalName', 'principalMobile']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        conn = get_db_connection()
        
        # Check if school already exists
        existing_school = conn.execute(
            'SELECT id FROM schools WHERE udise_code = ?', 
            (data['udiseCode'],)
        ).fetchone()
        
        if existing_school:
            return jsonify({'message': 'School with this UDISE code already exists'}), 400
        
        # Insert school data
        cursor = conn.execute('''
            INSERT INTO schools (name, udise_code, address, pin_code, phone, principal_name, principal_mobile)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['schoolName'],
            data['udiseCode'],
            data['schoolAddress'],
            data['pinCode'],
            data.get('schoolPhone', ''),
            data['principalName'],
            data['principalMobile']
        ))
        
        school_id = cursor.lastrowid
        
        # Create principal user account
        principal_password_hash = hash_password(data['principalMobile'])  # Default password is mobile number
        
        conn.execute('''
            INSERT INTO users (school_id, name, mobile, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            school_id,
            data['principalName'],
            data['principalMobile'],
            principal_password_hash,
            'principal'
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'School setup completed successfully',
            'school_id': school_id
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Error setting up school: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        password = data.get('password')
        role = data.get('role')
        
        if not mobile or not password or not role:
            return jsonify({'message': 'Mobile, password, and role are required'}), 400
        
        conn = get_db_connection()
        
        # Find user
        user = conn.execute('''
            SELECT u.*, s.name as school_name, s.udise_code 
            FROM users u 
            JOIN schools s ON u.school_id = s.id 
            WHERE u.mobile = ? AND u.role = ? AND u.is_active = 1
        ''', (mobile, role)).fetchone()
        
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate token
        user_data = {
            'id': user['id'],
            'mobile': user['mobile'],
            'role': user['role'],
            'school_id': user['school_id']
        }
        
        token = generate_token(user_data)
        
        conn.close()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'mobile': user['mobile'],
                'role': user['role'],
                'school_name': user['school_name'],
                'udise_code': user['udise_code'],
                'subject': user['subject'],
                'class_assigned': user['class_assigned']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login error: {str(e)}'}), 500

@app.route('/api/teachers', methods=['GET', 'POST'])
@token_required
def manage_teachers(current_user):
    """Get all teachers or add new teacher"""
    
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            teachers = conn.execute('''
                SELECT id, name, mobile, subject, class_assigned, is_active, created_at
                FROM users 
                WHERE school_id = ? AND role = 'teacher'
                ORDER BY name
            ''', (current_user['school_id'],)).fetchall()
            
            conn.close()
            
            teachers_list = []
            for teacher in teachers:
                teachers_list.append({
                    'id': teacher['id'],
                    'name': teacher['name'],
                    'mobile': teacher['mobile'],
                    'subject': teacher['subject'],
                    'class_assigned': teacher['class_assigned'],
                    'is_active': teacher['is_active'],
                    'created_at': teacher['created_at']
                })
            
            return jsonify({'teachers': teachers_list}), 200
            
        except Exception as e:
            return jsonify({'message': f'Error fetching teachers: {str(e)}'}), 500
    
    elif request.method == 'POST':
        # Only principals can add teachers
        if current_user['role'] != 'principal':
            return jsonify({'message': 'Only principals can add teachers'}), 403
        
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'mobile', 'subject', 'class_assigned']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'message': f'{field} is required'}), 400
            
            conn = get_db_connection()
            
            # Check if mobile number already exists
            existing_user = conn.execute(
                'SELECT id FROM users WHERE mobile = ?', 
                (data['mobile'],)
            ).fetchone()
            
            if existing_user:
                return jsonify({'message': 'User with this mobile number already exists'}), 400
            
            # Create teacher account (default password is mobile number)
            password_hash = hash_password(data['mobile'])
            
            cursor = conn.execute('''
                INSERT INTO users (school_id, name, mobile, password_hash, role, subject, class_assigned)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                current_user['school_id'],
                data['name'],
                data['mobile'],
                password_hash,
                'teacher',
                data['subject'],
                data['class_assigned']
            ))
            
            teacher_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                'message': 'Teacher added successfully',
                'teacher_id': teacher_id
            }), 201
            
        except Exception as e:
            return jsonify({'message': f'Error adding teacher: {str(e)}'}), 500

@app.route('/api/students', methods=['GET', 'POST'])
@token_required
def manage_students(current_user):
    """Get all students or add new student"""
    
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            students = conn.execute('''
                SELECT id, name, class, roll_number, father_name, mother_name, mobile, is_active, created_at
                FROM students 
                WHERE school_id = ? AND is_active = 1
                ORDER BY class, roll_number
            ''', (current_user['school_id'],)).fetchall()
            
            conn.close()
            
            students_list = []
            for student in students:
                students_list.append({
                    'id': student['id'],
                    'name': student['name'],
                    'class': student['class'],
                    'roll_number': student['roll_number'],
                    'father_name': student['father_name'],
                    'mother_name': student['mother_name'],
                    'mobile': student['mobile'],
                    'is_active': student['is_active'],
                    'created_at': student['created_at']
                })
            
            return jsonify({'students': students_list}), 200
            
        except Exception as e:
            return jsonify({'message': f'Error fetching students: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'class', 'roll_number']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'message': f'{field} is required'}), 400
            
            conn = get_db_connection()
            
            # Check if roll number already exists in the same class
            existing_student = conn.execute(
                'SELECT id FROM students WHERE school_id = ? AND class = ? AND roll_number = ? AND is_active = 1', 
                (current_user['school_id'], data['class'], data['roll_number'])
            ).fetchone()
            
            if existing_student:
                return jsonify({'message': 'Student with this roll number already exists in this class'}), 400
            
            cursor = conn.execute('''
                INSERT INTO students (school_id, name, class, roll_number, father_name, mother_name, address, mobile, date_of_birth)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                current_user['school_id'],
                data['name'],
                data['class'],
                data['roll_number'],
                data.get('father_name', ''),
                data.get('mother_name', ''),
                data.get('address', ''),
                data.get('mobile', ''),
                data.get('date_of_birth', None)
            ))
            
            student_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                'message': 'Student added successfully',
                'student_id': student_id
            }), 201
            
        except Exception as e:
            return jsonify({'message': f'Error adding student: {str(e)}'}), 500

@app.route('/api/calendar/events', methods=['GET', 'POST'])
@token_required
def manage_calendar_events(current_user):
    """Get calendar events or add new event"""
    
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            events = conn.execute('''
                SELECT ce.*, u.name as created_by_name
                FROM calendar_events ce
                JOIN users u ON ce.created_by = u.id
                WHERE ce.school_id = ? AND ce.is_active = 1
                ORDER BY ce.event_date
            ''', (current_user['school_id'],)).fetchall()
            
            conn.close()
            
            events_list = []
            for event in events:
                events_list.append({
                    'id': event['id'],
                    'title': event['title'],
                    'description': event['description'],
                    'event_date': event['event_date'],
                    'event_type': event['event_type'],
                    'created_by_name': event['created_by_name'],
                    'created_at': event['created_at']
                })
            
            return jsonify({'events': events_list}), 200
            
        except Exception as e:
            return jsonify({'message': f'Error fetching events: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['title', 'event_date', 'event_type']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'message': f'{field} is required'}), 400
            
            conn = get_db_connection()
            
            cursor = conn.execute('''
                INSERT INTO calendar_events (school_id, created_by, title, description, event_date, event_type)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                current_user['school_id'],
                current_user['user_id'],
                data['title'],
                data.get('description', ''),
                data['event_date'],
                data['event_type']
            ))
            
            event_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                'message': 'Event added successfully',
                'event_id': event_id
            }), 201
            
        except Exception as e:
            return jsonify({'message': f'Error adding event: {str(e)}'}), 500

# Serve static files for frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve frontend static files"""
    frontend_dir = os.path.dirname(__file__)  # Files are now in the same directory
    if path != "" and os.path.exists(os.path.join(frontend_dir, path)):
        return send_from_directory(frontend_dir, path)
    else:
        return send_from_directory(frontend_dir, 'index.html')

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)

