from flask import Blueprint, request, jsonify
from ..models import db, User
from ..schemas import UserAuthSchema
from passlib.hash import pbkdf2_sha256
from flask_jwt_extended import (
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
    jwt_required,
)
from pydantic import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = UserAuthSchema(**request.get_json())
        if User.query.filter_by(email=data.email).first():
            return jsonify({"error": "User already exists"}), 400
        
        new_user = User(email=data.email, password_hash=pbkdf2_sha256.hash(data.password))
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered"}), 201
    except ValidationError as e:
        return jsonify(e.errors()), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and pbkdf2_sha256.verify(data.get('password'), user.password_hash):
        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        response = jsonify(access_token=token)
        set_access_cookies(response, token)
        return response, 200
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify(True)
    unset_jwt_cookies(response)
    return response, 200