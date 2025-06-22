from flask import Flask, render_template, request, redirect, url_for, flash, Response, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, PasswordField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import base64
import io
import requests
import datetime
from PIL import Image
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = "BIGRO ON THAT BEAT YO"

MONGO_URI = "mongodb+srv://Devarya:Bisher1234@cluster0.nrwiryz.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client.gyft_app
users_collection = db.users
courses_collection = db.courses

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'account'

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.email = user_data['email']
        self.bio = user_data.get('bio', '')
        self.first_name = user_data.get('first_name', '')
        self.last_name = user_data.get('last_name', '')

@login_manager.user_loader
def load_user(user_id):
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(user_data)
    return None

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=1, max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=1, max=50)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])

class ProfileForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=1, max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=1, max=50)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    bio = TextAreaField('Bio', validators=[Length(max=500)])

class CourseForm(FlaskForm):
    topic = StringField('Course Topic', validators=[DataRequired(), Length(min=3, max=200)])
    submit = SubmitField('Generate Course')

class ProfileForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=1, max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=1, max=50)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    bio = TextAreaField('Bio', validators=[Length(max=500)])

def compress_image(image_file, max_size=(300, 300), quality=85):
    try:
        img = Image.open(image_file)
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=quality, optimize=True)
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()
    except Exception as e:
        print(f"Error compressing image: {e}")
        return None

def image_to_base64(image_data):
    return base64.b64encode(image_data).decode('utf-8')

def base64_to_image(base64_string):
    return base64.b64decode(base64_string)

@app.route('/')
def index():
    courses = []
    course_form = CourseForm()
    
    if current_user.is_authenticated:
        # Get user's courses
        courses = list(courses_collection.find({'user_id': ObjectId(current_user.id)}).sort('created_at', -1))
    
    return render_template('index.html', courses=courses, course_form=course_form)

@app.route('/account')
def account():
    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    
    login_form = LoginForm()
    register_form = RegisterForm()
    return render_template('account.html', login_form=login_form, register_form=register_form)

@app.route('/login', methods=['POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_data = users_collection.find_one({'username': form.username.data})
        if user_data and bcrypt.checkpw(form.password.data.encode('utf-8'), user_data['password']):
            user = User(user_data)
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('profile'))
        flash('Invalid username or password', 'error')
    return redirect(url_for('account'))

@app.route('/register', methods=['POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        if users_collection.find_one({'$or': [{'username': form.username.data}, {'email': form.email.data}]}):
            flash('Username or email already exists', 'error')
            return redirect(url_for('account'))
        
        hashed_password = bcrypt.hashpw(form.password.data.encode('utf-8'), bcrypt.gensalt())
        user_data = {
            'username': form.username.data,
            'email': form.email.data,
            'first_name': form.first_name.data,
            'last_name': form.last_name.data,
            'password': hashed_password,
            'bio': ''
        }
        
        result = users_collection.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        user = User(user_data)
        login_user(user)
        flash('Registration successful!', 'success')
        return redirect(url_for('profile'))
    
    return redirect(url_for('account'))

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    form = ProfileForm()
    
    if request.method == 'POST':
        # Handle profile update
        if form.validate_on_submit():
            if form.email.data != current_user.email:
                if users_collection.find_one({'email': form.email.data, '_id': {'$ne': ObjectId(current_user.id)}}):
                    flash('Email already exists', 'error')
                    return render_template('profile.html', user=current_user, form=form)
            
            update_data = {
                'first_name': form.first_name.data,
                'last_name': form.last_name.data,
                'email': form.email.data,
                'bio': form.bio.data
            }
            
            users_collection.update_one(
                {'_id': ObjectId(current_user.id)},
                {'$set': update_data}
            )
            
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile'))
    
    # Pre-populate form for GET requests
    form.first_name.data = current_user.first_name
    form.last_name.data = current_user.last_name
    form.email.data = current_user.email
    form.bio.data = current_user.bio
    
    return render_template('profile.html', user=current_user, form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/generate_course', methods=['POST'])
@login_required
def generate_course():
    form = CourseForm()
    if form.validate_on_submit():
        topic = form.topic.data
        
        # Generate course using the API
        response = requests.post('https://gyft-ai-ten.vercel.app/gc', json={'prompt': topic}, timeout=30)
        print(response)
        bisher = response.get("response", "")
        course_data = json.loads(bisher)
        with open('course_data.json', 'w') as f:
            json.dump(course_data, f, indent=4)
            

        
        if course_data:
            # Store course in database
            course_document = {
                'user_id': ObjectId(current_user.id),
                'title': course_data.get('t', 'Untitled Course'),
                'description': course_data.get('d', ''),
                'language': course_data.get('l', ''),
                'chapters': course_data.get('c', []),
                'topic': topic,
                'created_at': datetime.datetime.utcnow()
            }
            
            courses_collection.insert_one(course_document)
            flash(f'Course "{course_data.get("t", "Untitled")}" generated successfully!', 'success')
        else:
            flash('Failed to generate course. Please try again.', 'error')
    else:
        flash('Invalid course topic. Please try again.', 'error')
    
    return redirect(url_for('index'))

@app.route('/course/<course_id>')
@login_required
def view_course(course_id):
    try:
        course = courses_collection.find_one({
            '_id': ObjectId(course_id),
            'user_id': ObjectId(current_user.id)
        })
        
        if not course:
            flash('Course not found.', 'error')
            return redirect(url_for('index'))
        
        return render_template('course.html', course=course)
    except Exception as e:
        flash('Error loading course.', 'error')
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5050)