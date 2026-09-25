from fastapi import APIRouter
from app.schemas.rag import EvaluationMetrics
from app.services.evaluator import rag_evaluator

router = APIRouter()

@router.get("", response_model=EvaluationMetrics)
def get_evaluation_metrics():
    return rag_evaluator.get_metrics()
