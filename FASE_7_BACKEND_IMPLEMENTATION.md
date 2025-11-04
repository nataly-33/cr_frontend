# Fase 7: Guía de Implementación - Backend ↔ Frontend

Este documento describe cómo implementar los endpoints en el backend para que funcione con la integración frontend de IA.

---

## 1. Endpoints Requeridos en Django

### 1.1 Endpoint de Análisis

**URL**: `POST /api/reports/executions/{id}/analyze/`  
**Método**: POST  
**Autenticación**: Requerida  
**Permisos**: `reports.analyze_execution`

**Request Body**: (vacío - usa el reporte del ID)

**Response 200 OK**:
```json
{
  "id": "uuid",
  "report_id": "uuid",
  "analysis": "Texto largo del análisis...",
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ],
  "key_findings": [
    "Hallazgo principal 1",
    "Hallazgo principal 2"
  ],
  "confidence_score": 0.85,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

**Error 404**:
```json
{
  "detail": "Report execution not found or not completed"
}
```

---

### 1.2 Endpoint de Resumen

**URL**: `POST /api/reports/executions/{id}/summarize/`  
**Método**: POST  
**Query Params**: `max_length` (opcional, default: 500)

**Request Body**: (vacío)

**Response 200 OK**:
```json
{
  "id": "uuid",
  "summary": "Resumen generado por IA...",
  "key_points": [
    "Punto clave 1",
    "Punto clave 2",
    "Punto clave 3"
  ],
  "length": 250,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

---

### 1.3 Endpoint de Recomendaciones

**URL**: `GET /api/reports/executions/{id}/recommendations/`  
**Método**: GET  
**Autenticación**: Requerida

**Response 200 OK**:
```json
[
  {
    "id": "uuid",
    "recommendation": "Se recomienda...",
    "priority": "high",
    "category": "performance",
    "action_items": [
      "Acción 1",
      "Acción 2"
    ]
  },
  {
    "id": "uuid2",
    "recommendation": "Considere...",
    "priority": "medium",
    "category": "data-quality",
    "action_items": [
      "Acción 1"
    ]
  }
]
```

---

### 1.4 Endpoint de Insights Completos

**URL**: `GET /api/reports/executions/{id}/ai-insights/`  
**Método**: GET  
**Autenticación**: Requerida  

**Response 200 OK**:
```json
{
  "analysis": {
    "id": "uuid",
    "report_id": "uuid",
    "analysis": "...",
    "insights": [...],
    "key_findings": [...],
    "confidence_score": 0.85,
    "generated_at": "2024-01-15T10:30:00Z"
  },
  "summary": {
    "id": "uuid",
    "summary": "...",
    "key_points": [...],
    "length": 250,
    "generated_at": "2024-01-15T10:30:00Z"
  },
  "recommendations": [
    {
      "id": "uuid",
      "recommendation": "...",
      "priority": "high",
      "category": "performance",
      "action_items": [...]
    }
  ],
  "status": "completed",
  "message": null
}
```

---

## 2. Implementación en Django

### 2.1 Modelo para Almacenar Análisis

```python
# apps/reports/models.py

from django.db import models
from django.contrib.postgres.fields import ArrayField

class AIAnalysis(models.Model):
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    report_execution = models.OneToOneField(
        ReportExecution,
        on_delete=models.CASCADE,
        related_name='ai_analysis'
    )
    analysis = models.TextField()
    insights = ArrayField(models.TextField())
    key_findings = ArrayField(models.TextField())
    confidence_score = models.FloatField()
    summary = models.TextField(null=True, blank=True)
    summary_key_points = ArrayField(
        models.TextField(),
        null=True,
        blank=True
    )
    recommendations = models.JSONField(default=list)  # List of dicts
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_analysis'
        verbose_name = 'AI Analysis'
        verbose_name_plural = 'AI Analyses'
        indexes = [
            models.Index(fields=['report_execution', 'created_at']),
        ]

    def __str__(self):
        return f"Analysis for {self.report_execution_id}"
```

### 2.2 Serializers

```python
# apps/reports/serializers.py

from rest_framework import serializers
from .models import AIAnalysis, ReportExecution

class AIAnalysisSerializer(serializers.ModelSerializer):
    generated_at = serializers.DateTimeField(source='created_at', read_only=True)
    report_id = serializers.CharField(
        source='report_execution_id',
        read_only=True
    )
    id = serializers.CharField(source='id', read_only=True)

    class Meta:
        model = AIAnalysis
        fields = [
            'id', 'report_id', 'analysis', 'insights',
            'key_findings', 'confidence_score', 'generated_at'
        ]

class AISummarySerializer(serializers.Serializer):
    id = serializers.CharField()
    summary = serializers.CharField()
    key_points = serializers.ListField(child=serializers.CharField())
    length = serializers.IntegerField()
    generated_at = serializers.DateTimeField()

class AIRecommendationSerializer(serializers.Serializer):
    id = serializers.CharField()
    recommendation = serializers.CharField()
    priority = serializers.ChoiceField(
        choices=['critical', 'high', 'medium', 'low']
    )
    category = serializers.CharField()
    action_items = serializers.ListField(child=serializers.CharField())

class AIInsightsResponseSerializer(serializers.Serializer):
    analysis = AIAnalysisSerializer(required=False, allow_null=True)
    summary = AISummarySerializer(required=False, allow_null=True)
    recommendations = AIRecommendationSerializer(many=True, required=False)
    status = serializers.CharField(required=False)
    message = serializers.CharField(required=False, allow_null=True)
```

### 2.3 Views

```python
# apps/reports/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ReportExecution, AIAnalysis
from .serializers import (
    AIAnalysisSerializer,
    AISummarySerializer,
    AIRecommendationSerializer,
    AIInsightsResponseSerializer
)
from .services.ai_analysis_service import AIAnalysisService

class ReportExecutionViewSet(viewsets.ModelViewSet):
    queryset = ReportExecution.objects.all()
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """
        Analyze a report execution with AI
        POST /reports/executions/{id}/analyze/
        """
        try:
            execution = self.get_object()
            
            # Verify report is completed
            if execution.status != 'completed':
                return Response(
                    {'detail': 'Report execution not completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create analysis
            analysis, created = AIAnalysis.objects.get_or_create(
                report_execution=execution
            )

            # If not already analyzed, trigger analysis
            if created or analysis.status == 'pending':
                service = AIAnalysisService()
                analysis = service.analyze_report(execution, analysis)

            serializer = AIAnalysisSerializer(analysis)
            return Response(serializer.data)

        except ReportExecution.DoesNotExist:
            return Response(
                {'detail': 'Report execution not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def summarize(self, request, pk=None):
        """
        Generate AI summary for a report
        POST /reports/executions/{id}/summarize/?max_length=500
        """
        try:
            execution = self.get_object()
            max_length = int(request.query_params.get('max_length', 500))

            if execution.status != 'completed':
                return Response(
                    {'detail': 'Report execution not completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            service = AIAnalysisService()
            summary = service.generate_summary(execution, max_length)

            serializer = AISummarySerializer(summary)
            return Response(serializer.data)

        except ReportExecution.DoesNotExist:
            return Response(
                {'detail': 'Report execution not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """
        Get AI recommendations for a report
        GET /reports/executions/{id}/recommendations/
        """
        try:
            execution = self.get_object()

            if execution.status != 'completed':
                return Response(
                    {'detail': 'Report execution not completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            service = AIAnalysisService()
            recommendations = service.get_recommendations(execution)

            serializer = AIRecommendationSerializer(recommendations, many=True)
            return Response(serializer.data)

        except ReportExecution.DoesNotExist:
            return Response(
                {'detail': 'Report execution not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def ai_insights(self, request, pk=None):
        """
        Get complete AI insights for a report
        GET /reports/executions/{id}/ai-insights/
        """
        try:
            execution = self.get_object()

            if execution.status != 'completed':
                return Response(
                    {'detail': 'Report execution not completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            service = AIAnalysisService()
            insights = service.get_complete_insights(execution)

            serializer = AIInsightsResponseSerializer(insights)
            return Response(serializer.data)

        except ReportExecution.DoesNotExist:
            return Response(
                {'detail': 'Report execution not found'},
                status=status.HTTP_404_NOT_FOUND
            )
```

### 2.4 Service para Análisis de IA

```python
# apps/reports/services/ai_analysis_service.py

from apps.reports.llm_adapter import LLMManager
from apps.reports.models import AIAnalysis, ReportExecution
import json
import re

class AIAnalysisService:
    def __init__(self):
        self.llm_manager = LLMManager()

    def analyze_report(self, execution: ReportExecution, analysis: AIAnalysis) -> AIAnalysis:
        """Analyze a report execution with AI"""
        try:
            # Get report data
            report_data = self._get_report_data(execution)
            
            # Generate analysis
            analysis_text = self.llm_manager.analyze(report_data)
            
            # Parse response
            parsed = self._parse_analysis(analysis_text)
            
            # Save to database
            analysis.analysis = parsed['analysis']
            analysis.insights = parsed['insights']
            analysis.key_findings = parsed['key_findings']
            analysis.confidence_score = parsed['confidence_score']
            analysis.status = 'completed'
            analysis.save()
            
            return analysis
            
        except Exception as e:
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.save()
            raise

    def generate_summary(self, execution: ReportExecution, max_length: int = 500) -> dict:
        """Generate AI summary for a report"""
        report_data = self._get_report_data(execution)
        summary_text = self.llm_manager.summarize(report_data, max_length)
        
        return {
            'id': execution.id,
            'summary': summary_text,
            'key_points': self._extract_key_points(summary_text),
            'length': len(summary_text.split()),
            'generated_at': self._get_timestamp()
        }

    def get_recommendations(self, execution: ReportExecution) -> list:
        """Get AI recommendations for a report"""
        report_data = self._get_report_data(execution)
        recommendations_text = self.llm_manager.get_recommendations(report_data)
        
        return self._parse_recommendations(recommendations_text)

    def get_complete_insights(self, execution: ReportExecution) -> dict:
        """Get complete AI insights"""
        try:
            # Get or create analysis
            analysis, _ = AIAnalysis.objects.get_or_create(
                report_execution=execution
            )

            # Trigger analysis if not done
            if analysis.status == 'pending':
                analysis = self.analyze_report(execution, analysis)

            # Get other insights
            summary = self.generate_summary(execution)
            recommendations = self.get_recommendations(execution)

            return {
                'analysis': self._serialize_analysis(analysis),
                'summary': summary,
                'recommendations': recommendations,
                'status': 'completed',
                'message': None
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }

    # Helper methods
    def _get_report_data(self, execution: ReportExecution) -> str:
        """Extract report data for analysis"""
        # This depends on your report structure
        # Return the actual report content as string
        pass

    def _parse_analysis(self, text: str) -> dict:
        """Parse analysis response from LLM"""
        return {
            'analysis': text,
            'insights': self._extract_insights(text),
            'key_findings': self._extract_key_findings(text),
            'confidence_score': 0.85
        }

    def _extract_insights(self, text: str) -> list:
        """Extract insights from text"""
        # Split by line breaks and filter empty lines
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return lines[:5]  # Take first 5

    def _extract_key_findings(self, text: str) -> list:
        """Extract key findings from text"""
        # Could use regex or NLP to identify key findings
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return lines[:3]  # Take first 3

    def _extract_key_points(self, text: str) -> list:
        """Extract key points for summary"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return lines[:5]

    def _parse_recommendations(self, text: str) -> list:
        """Parse recommendations response"""
        try:
            data = json.loads(text)
            if isinstance(data, list):
                return data
        except json.JSONDecodeError:
            pass
        
        return []

    def _serialize_analysis(self, analysis: AIAnalysis) -> dict:
        """Serialize AIAnalysis model"""
        return {
            'id': str(analysis.id),
            'report_id': str(analysis.report_execution_id),
            'analysis': analysis.analysis,
            'insights': analysis.insights,
            'key_findings': analysis.key_findings,
            'confidence_score': analysis.confidence_score,
            'generated_at': analysis.created_at.isoformat()
        }

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from django.utils import timezone
        return timezone.now().isoformat()
```

### 2.5 URLs

```python
# apps/reports/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportExecutionViewSet

router = DefaultRouter()
router.register(r'executions', ReportExecutionViewSet, basename='execution')

urlpatterns = [
    path('', include(router.urls)),
]

# En config/urls.py:
# path('api/reports/', include('apps.reports.urls')),
```

---

## 3. Migración de Base de Datos

```bash
python manage.py makemigrations reports
python manage.py migrate reports
```

---

## 4. Permisos

Agregar a `apps/core/permissions.py`:

```python
# apps/core/permissions.py

PERMISSIONS = {
    'reports': {
        'analyze_execution': 'Can analyze report executions with AI',
        'summarize_execution': 'Can generate summaries for report executions',
        'get_recommendations': 'Can get AI recommendations for report executions',
        'view_ai_insights': 'Can view AI insights for report executions',
    }
}
```

---

## 5. Testing

```python
# apps/reports/tests/test_ai_endpoints.py

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class AIAnalysisEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create test data

    def test_analyze_endpoint(self):
        """Test analyze endpoint"""
        response = self.client.post(f'/api/reports/executions/{id}/analyze/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', response.data)

    def test_summarize_endpoint(self):
        """Test summarize endpoint"""
        response = self.client.post(f'/api/reports/executions/{id}/summarize/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)

    def test_recommendations_endpoint(self):
        """Test recommendations endpoint"""
        response = self.client.get(f'/api/reports/executions/{id}/recommendations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_ai_insights_endpoint(self):
        """Test complete insights endpoint"""
        response = self.client.get(f'/api/reports/executions/{id}/ai-insights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', response.data)
        self.assertIn('summary', response.data)
        self.assertIn('recommendations', response.data)
```

---

## 6. Checklist de Implementación

- [ ] Crear modelo `AIAnalysis`
- [ ] Crear serializers para AI responses
- [ ] Agregar views y endpoints
- [ ] Crear service `AIAnalysisService`
- [ ] Agregar URLs
- [ ] Crear migración
- [ ] Agregar permisos
- [ ] Crear tests
- [ ] Documentar endpoints en API docs
- [ ] Probar con frontend

---

## 7. URLs Finales

```
POST   /api/reports/executions/{id}/analyze/
POST   /api/reports/executions/{id}/summarize/?max_length=500
GET    /api/reports/executions/{id}/recommendations/
GET    /api/reports/executions/{id}/ai-insights/
```

---

Siguiente: Una vez implementado el backend, el frontend funcionará automáticamente con los nuevos endpoints.
