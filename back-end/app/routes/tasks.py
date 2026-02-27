from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, Task
from ..schemas import TaskCreateSchema, TaskUpdateSchema
from pydantic import ValidationError

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['GET', 'POST'])
@jwt_required()
def handle_tasks():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "user")

    if request.method == 'POST':
        try:
            payload = request.get_json()
            if not payload:
                return jsonify({"error": "Request body is required"}), 400

            data = TaskCreateSchema(**payload)
            task = Task(title=data.title, description=data.description, user_id=user_id)
            db.session.add(task)
            db.session.commit()
            return jsonify({
                "message": "Task created",
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status
            }), 201
        except ValidationError as e:
            return jsonify(e.errors()), 400

    # Admin can see all tasks; normal user only their own
    if role == "admin":
        tasks = Task.query.all()
    else:
        tasks = Task.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status
        }
        for t in tasks
    ])

@tasks_bp.route('/<int:task_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modify_task(task_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "user")

    # Admin can modify any task; user only their own
    if role == "admin":
        task = Task.query.filter_by(id=task_id).first_or_404()
    else:
        task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()

    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200

    try:
        data = TaskUpdateSchema(**request.get_json())
        if data.title: task.title = data.title
        if data.description: task.description = data.description
        if data.status: task.status = data.status
        db.session.commit()
        return jsonify({"message": "Updated"}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400