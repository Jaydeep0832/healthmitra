import asyncio
import pytest
from app.models.scheme import (
    SchemeCategory,
    SchemeVerificationStatus,
    ClaimType,
    ClaimCreateRequest,
    EligibilityCheckRequest,
)
from app.services.scheme_service import SchemeService

def get_service():
    return SchemeService()

@pytest.mark.asyncio
async def test_get_all_schemes():
    service = get_service()
    schemes = await service.get_schemes()
    assert len(schemes) >= 7, f"Expected at least 7 schemes, got {len(schemes)}"
    for s in schemes:
        assert s.name, "Scheme must have a name"
        assert s.verification_status in [SchemeVerificationStatus.VERIFIED, SchemeVerificationStatus.ACTIVE]
        assert s.last_verified_on, "Scheme must have a verification date"
        assert len(s.covered_treatments) > 0, "Scheme must list covered treatments"
        assert len(s.required_documents) > 0, "Scheme must list required documents"
        assert s.application_link.startswith("http"), "Scheme must have valid application link"

@pytest.mark.asyncio
async def test_filter_schemes_by_category():
    service = get_service()
    surgery_schemes = await service.get_schemes(category="operations_surgery")
    assert len(surgery_schemes) > 0, "Expected surgery schemes"
    for s in surgery_schemes:
        assert SchemeCategory.OPERATIONS_SURGERY in s.categories

@pytest.mark.asyncio
async def test_filter_schemes_by_state():
    service = get_service()
    gujarat_schemes = await service.get_schemes(state="Gujarat")
    assert any(s.id == "gujarat-maa-yojana" for s in gujarat_schemes), "Gujarat MAA Yojana should be returned"
    assert any(s.state_jurisdiction == "All India" for s in gujarat_schemes), "Central schemes should be included"

@pytest.mark.asyncio
async def test_middle_class_filter():
    service = get_service()
    mc_schemes = await service.get_schemes(middle_class_only=True)
    assert len(mc_schemes) > 0, "Expected middle-class friendly schemes"
    assert all(s.middle_class_friendly for s in mc_schemes)

@pytest.mark.asyncio
async def test_insurance_policies():
    service = get_service()
    policies = await service.get_insurance_policies()
    assert len(policies) >= 4, f"Expected at least 4 insurance policies, got {len(policies)}"
    for p in policies:
        assert p.policy_name
        assert p.premium_range
        assert p.claim_settlement_ratio
        assert p.irdai_registration

@pytest.mark.asyncio
async def test_claims_tracking():
    service = get_service()
    initial_claims = await service.get_claims()
    assert len(initial_claims) >= 3

    new_claim = await service.track_claim(
        ClaimCreateRequest(
            scheme_or_policy="Ayushman Bharat PM-JAY",
            patient_name="Sanjay Sharma",
            hospital_name="Sterling Hospital",
            claim_type=ClaimType.CASHLESS,
            amount_claimed=65000.0,
            notes="Under review at TPA desk"
        )
    )
    assert new_claim.patient_name == "Sanjay Sharma"
    assert new_claim.is_verified is False
    assert "Unverified" in new_claim.source.value

@pytest.mark.asyncio
async def test_eligibility_checker_senior_70_plus():
    service = get_service()
    req = EligibilityCheckRequest(
        state="Gujarat",
        annual_income=800000.0,
        age=72,
        illness_type="Cardiac bypass",
        category="Senior Citizen"
    )
    matches = await service.check_eligibility(req)
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match.scheme.id == "pmjay-vay-vandana"
    assert top_match.is_eligible is True
    assert top_match.match_score >= 80

@pytest.mark.asyncio
async def test_eligibility_checker_low_income_surgery():
    service = get_service()
    req = EligibilityCheckRequest(
        state="Gujarat",
        annual_income=250000.0,
        age=45,
        illness_type="Gallstone surgery",
        category="General"
    )
    matches = await service.check_eligibility(req)
    eligible_schemes = [m.scheme.id for m in matches if m.is_eligible]
    assert "gujarat-maa-yojana" in eligible_schemes or "pmjay-ayushman" in eligible_schemes

if __name__ == "__main__":
    async def run_all():
        await test_get_all_schemes()
        print("[PASS] test_get_all_schemes")
        await test_filter_schemes_by_category()
        print("[PASS] test_filter_schemes_by_category")
        await test_filter_schemes_by_state()
        print("[PASS] test_filter_schemes_by_state")
        await test_middle_class_filter()
        print("[PASS] test_middle_class_filter")
        await test_insurance_policies()
        print("[PASS] test_insurance_policies")
        await test_claims_tracking()
        print("[PASS] test_claims_tracking")
        await test_eligibility_checker_senior_70_plus()
        print("[PASS] test_eligibility_checker_senior_70_plus")
        await test_eligibility_checker_low_income_surgery()
        print("[PASS] test_eligibility_checker_low_income_surgery")
        print("ALL 8 SCHEME BACKEND TESTS PASSED SUCCESSFULLY!")

    asyncio.run(run_all())
