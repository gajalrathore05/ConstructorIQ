import json
import logging
import os
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import Analysis

logger = logging.getLogger(__name__)


def generate_pdf_report(analysis_id: int, db: Session) -> Optional[str]:
    """Generate a PDF report for an analysis. Returns file path or None."""
    try:
        from fpdf import FPDF

        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            return None

        result = {}
        if analysis.result_json:
            try:
                result = json.loads(analysis.result_json)
            except Exception:
                pass

        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Header background
        pdf.set_fill_color(20, 40, 63)
        pdf.rect(0, 0, 210, 32, "F")
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_xy(0, 8)
        pdf.cell(210, 10, "ConstructIQ Analysis Report", align="C", ln=True)
        pdf.set_font("Helvetica", size=9)
        pdf.cell(210, 7, "Intelligent Decisions. Safer Construction.", align="C", ln=True)

        pdf.set_text_color(23, 43, 58)
        pdf.set_y(40)

        # Metadata
        pdf.set_font("Helvetica", "B", 12)
        analysis_type_label = analysis.analysis_type.replace("_", " ").title()
        pdf.cell(0, 8, f"Report: {analysis_type_label} Analysis", ln=True)
        pdf.set_font("Helvetica", size=10)
        pdf.cell(0, 6, f"Analysis ID: {analysis.id}", ln=True)
        pdf.cell(0, 6, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ln=True)
        if analysis.created_at:
            pdf.cell(0, 6, f"Analysis Date: {analysis.created_at.strftime('%Y-%m-%d %H:%M UTC')}", ln=True)
        if analysis.title:
            pdf.cell(0, 6, f"Title: {analysis.title}", ln=True)
        if analysis.input_summary:
            pdf.multi_cell(0, 6, f"Input: {analysis.input_summary}")

        pdf.ln(4)
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

        # Summary
        if result.get("summary"):
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Summary", ln=True)
            pdf.set_font("Helvetica", size=10)
            pdf.multi_cell(0, 6, result["summary"])
            pdf.ln(3)

        # Findings (safety)
        if result.get("findings"):
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Findings", ln=True)
            for i, f in enumerate(result["findings"], 1):
                sev = f.get("severity", "unknown").upper()
                pdf.set_font("Helvetica", "B", 10)
                pdf.cell(0, 7, f"{i}. [{sev}] {f.get('category', 'Unknown Category')}", ln=True)
                pdf.set_font("Helvetica", size=10)
                if f.get("observation"):
                    pdf.multi_cell(0, 6, f"   Observation: {f['observation']}")
                if f.get("recommended_action"):
                    pdf.multi_cell(0, 6, f"   Action: {f['recommended_action']}")
                pdf.ln(2)

        # Observations (crack)
        if result.get("observations"):
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Observations", ln=True)
            pdf.set_font("Helvetica", size=10)
            for obs in result["observations"]:
                pdf.multi_cell(0, 6, f"• {obs}")
            pdf.ln(3)

        # Crack details
        if result.get("crack_details"):
            cd = result["crack_details"]
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Crack Details", ln=True)
            pdf.set_font("Helvetica", size=10)
            if cd.get("pattern"):
                pdf.cell(0, 6, f"Pattern: {cd['pattern']}", ln=True)
            if cd.get("location"):
                pdf.cell(0, 6, f"Location: {cd['location']}", ln=True)
            if cd.get("potential_causes"):
                pdf.cell(0, 6, "Potential Causes:", ln=True)
                for cause in cd["potential_causes"]:
                    pdf.multi_cell(0, 6, f"  • {cause}")
            if cd.get("recommended_actions"):
                pdf.cell(0, 6, "Recommended Actions:", ln=True)
                for action in cd["recommended_actions"]:
                    pdf.multi_cell(0, 6, f"  • {action}")
            pdf.ln(3)

        # Valuation
        if result.get("estimated_value_min") is not None and result.get("estimated_value_min", 0) > 0:
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Valuation Estimate", ln=True)
            pdf.set_font("Helvetica", size=10)
            pdf.cell(0, 6, f"Estimated Value Range: {result['estimated_value_min']:,.0f} — {result['estimated_value_max']:,.0f}", ln=True)
            if result.get("price_per_sqft"):
                pdf.cell(0, 6, f"Price per sqft: {result['price_per_sqft']:,.2f}", ln=True)
            if result.get("key_factors"):
                pdf.cell(0, 6, "Key Factors:", ln=True)
                for factor in result["key_factors"]:
                    pdf.multi_cell(0, 6, f"  • {factor}")
            pdf.ln(3)

        # Limitations
        if result.get("limitations"):
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Limitations", ln=True)
            pdf.set_font("Helvetica", size=10)
            for lim in result["limitations"]:
                pdf.multi_cell(0, 6, f"• {lim}")
            pdf.ln(3)

        # Disclaimer
        disclaimer = result.get("disclaimer", (
            "This report is for informational purposes only. ConstructIQ AI analysis "
            "is preliminary decision support and does not replace professional assessment."
        ))
        if pdf.get_y() > 250:
            pdf.add_page()
        pdf.ln(4)
        pdf.set_fill_color(245, 247, 250)
        pdf.set_font("Helvetica", "I", 9)
        pdf.multi_cell(0, 5, f"DISCLAIMER: {disclaimer}", border=0)

        # Footer
        pdf.set_y(-15)
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 10, f"ConstructIQ — Intelligent Decisions. Safer Construction. | Page {pdf.page_no()}", align="C")

        # Save
        reports_dir = os.path.join("uploads", "reports")
        os.makedirs(reports_dir, exist_ok=True)
        filename = f"constructiq_report_{analysis_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(reports_dir, filename)
        pdf.output(filepath)
        logger.info(f"PDF report saved: {filepath}")
        return filepath

    except ImportError:
        logger.error("fpdf2 not installed — cannot generate PDF")
        return None
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        return None
