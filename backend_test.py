#!/usr/bin/env python3
"""
Backend API Testing for The Rival Syndicate
Tests all backend endpoints according to test_result.md requirements
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend/.env
BASE_URL = "https://boostservice.preview.emergentagent.com/api"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.results = []
        self.failed_tests = []
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.results.append(result)
        
        if not success:
            self.failed_tests.append(result)
            
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        if response_data and not success:
            print(f"    Response: {response_data}")
        print()

    def test_health_check(self):
        """Test GET /api/ - Health check"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_result(
                        "Health Check (GET /api/)", 
                        True, 
                        f"Status: {response.status_code}, Message: {data.get('message')}, Status: {data.get('status')}"
                    )
                else:
                    self.log_result(
                        "Health Check (GET /api/)", 
                        False, 
                        f"Missing required fields in response",
                        data
                    )
            else:
                self.log_result(
                    "Health Check (GET /api/)", 
                    False, 
                    f"Expected 200, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_result("Health Check (GET /api/)", False, f"Exception: {str(e)}")

    def test_services_api(self):
        """Test GET /api/services - Returns service types"""
        try:
            response = self.session.get(f"{BASE_URL}/services")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if service has required fields
                    first_service = data[0]
                    required_fields = ["id", "name", "description"]
                    if all(field in first_service for field in required_fields):
                        self.log_result(
                            "Services API (GET /api/services)", 
                            True, 
                            f"Returned {len(data)} services"
                        )
                    else:
                        self.log_result(
                            "Services API (GET /api/services)", 
                            False, 
                            f"Service missing required fields: {required_fields}",
                            first_service
                        )
                else:
                    self.log_result(
                        "Services API (GET /api/services)", 
                        False, 
                        "Expected non-empty list",
                        data
                    )
            else:
                self.log_result(
                    "Services API (GET /api/services)", 
                    False, 
                    f"Expected 200, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_result("Services API (GET /api/services)", False, f"Exception: {str(e)}")

    def test_characters_api(self):
        """Test GET /api/characters - Returns all characters grouped by class"""
        try:
            response = self.session.get(f"{BASE_URL}/characters")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    expected_classes = ["duelist", "vanguard", "strategist"]
                    if all(cls in data for cls in expected_classes):
                        total_chars = sum(len(chars) for chars in data.values())
                        self.log_result(
                            "Characters API (GET /api/characters)", 
                            True, 
                            f"Returned {total_chars} characters across {len(data)} classes"
                        )
                    else:
                        self.log_result(
                            "Characters API (GET /api/characters)", 
                            False, 
                            f"Missing expected classes: {expected_classes}",
                            list(data.keys())
                        )
                else:
                    self.log_result(
                        "Characters API (GET /api/characters)", 
                        False, 
                        "Expected object with character classes",
                        data
                    )
            else:
                self.log_result(
                    "Characters API (GET /api/characters)", 
                    False, 
                    f"Expected 200, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_result("Characters API (GET /api/characters)", False, f"Exception: {str(e)}")

    def test_characters_by_class(self):
        """Test GET /api/characters/duelist - Returns duelist characters"""
        try:
            response = self.session.get(f"{BASE_URL}/characters/duelist")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if character has required fields
                    first_char = data[0]
                    required_fields = ["id", "name", "basePrice"]
                    if all(field in first_char for field in required_fields):
                        self.log_result(
                            "Characters by Class (GET /api/characters/duelist)", 
                            True, 
                            f"Returned {len(data)} duelist characters"
                        )
                    else:
                        self.log_result(
                            "Characters by Class (GET /api/characters/duelist)", 
                            False, 
                            f"Character missing required fields: {required_fields}",
                            first_char
                        )
                else:
                    self.log_result(
                        "Characters by Class (GET /api/characters/duelist)", 
                        False, 
                        "Expected non-empty list of duelist characters",
                        data
                    )
            else:
                self.log_result(
                    "Characters by Class (GET /api/characters/duelist)", 
                    False, 
                    f"Expected 200, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_result("Characters by Class (GET /api/characters/duelist)", False, f"Exception: {str(e)}")

    def test_discord_oauth_login(self):
        """Test GET /api/auth/discord/login - Should redirect to Discord OAuth URL"""
        try:
            # Use allow_redirects=False to check the redirect response
            response = self.session.get(f"{BASE_URL}/auth/discord/login", allow_redirects=False)
            
            if response.status_code in [302, 307]:
                location = response.headers.get('Location', '')
                if 'discord.com/api/oauth2/authorize' in location and 'client_id=' in location:
                    self.log_result(
                        "Discord OAuth Login (GET /api/auth/discord/login)", 
                        True, 
                        f"Redirects to Discord OAuth (Status: {response.status_code})"
                    )
                else:
                    self.log_result(
                        "Discord OAuth Login (GET /api/auth/discord/login)", 
                        False, 
                        f"Invalid redirect URL: {location}"
                    )
            else:
                self.log_result(
                    "Discord OAuth Login (GET /api/auth/discord/login)", 
                    False, 
                    f"Expected redirect (302/307), got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_result("Discord OAuth Login (GET /api/auth/discord/login)", False, f"Exception: {str(e)}")

    def test_auth_required_endpoints(self):
        """Test authentication-required endpoints without token (should return 401)"""
        auth_endpoints = [
            ("GET", "/auth/me", "Get Current User"),
            ("GET", "/orders", "Get User Orders"),
            ("POST", "/orders", "Create Order")
        ]
        
        for method, endpoint, description in auth_endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{BASE_URL}{endpoint}")
                elif method == "POST":
                    # For POST /orders, send minimal data to test auth
                    test_data = {
                        "service_type": "priority-farm",
                        "character_id": "hela",
                        "character_name": "Hela",
                        "character_class": "duelist",
                        "price": 25.0,
                        "payment_method": "paypal"
                    }
                    response = self.session.post(f"{BASE_URL}{endpoint}", json=test_data)
                
                if response.status_code == 401:
                    self.log_result(
                        f"Auth Required - {description} ({method} {endpoint})", 
                        True, 
                        "Correctly returns 401 without authentication"
                    )
                else:
                    self.log_result(
                        f"Auth Required - {description} ({method} {endpoint})", 
                        False, 
                        f"Expected 401, got {response.status_code}",
                        response.text
                    )
            except Exception as e:
                self.log_result(f"Auth Required - {description} ({method} {endpoint})", False, f"Exception: {str(e)}")

    def test_admin_endpoints_without_auth(self):
        """Test admin endpoints without authentication (should return 401)"""
        admin_endpoints = [
            ("GET", "/admin/orders", "Get All Orders (Admin)"),
            ("GET", "/admin/boosters", "Get Boosters (Admin)"),
            ("GET", "/users", "Get All Users (Admin)")
        ]
        
        for method, endpoint, description in admin_endpoints:
            try:
                response = self.session.get(f"{BASE_URL}{endpoint}")
                
                if response.status_code == 401:
                    self.log_result(
                        f"Admin Auth - {description} ({method} {endpoint})", 
                        True, 
                        "Correctly returns 401 without authentication"
                    )
                else:
                    self.log_result(
                        f"Admin Auth - {description} ({method} {endpoint})", 
                        False, 
                        f"Expected 401, got {response.status_code}",
                        response.text
                    )
            except Exception as e:
                self.log_result(f"Admin Auth - {description} ({method} {endpoint})", False, f"Exception: {str(e)}")

    def test_invalid_endpoints(self):
        """Test some invalid endpoints to ensure proper 404 handling"""
        invalid_endpoints = [
            "/nonexistent",
            "/characters/invalid_class",
            "/orders/invalid_id"
        ]
        
        for endpoint in invalid_endpoints:
            try:
                response = self.session.get(f"{BASE_URL}{endpoint}")
                
                if response.status_code == 404:
                    self.log_result(
                        f"404 Handling (GET {endpoint})", 
                        True, 
                        "Correctly returns 404 for invalid endpoint"
                    )
                elif response.status_code == 422:
                    # Some endpoints might return 422 for validation errors
                    self.log_result(
                        f"404 Handling (GET {endpoint})", 
                        True, 
                        "Returns 422 for validation error (acceptable)"
                    )
                else:
                    self.log_result(
                        f"404 Handling (GET {endpoint})", 
                        False, 
                        f"Expected 404, got {response.status_code}",
                        response.text
                    )
            except Exception as e:
                self.log_result(f"404 Handling (GET {endpoint})", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("BACKEND API TESTING - THE RIVAL SYNDICATE")
        print("=" * 60)
        print(f"Base URL: {BASE_URL}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print("=" * 60)
        print()

        # Core API Tests
        print("🔍 CORE API TESTS")
        print("-" * 30)
        self.test_health_check()
        self.test_services_api()
        self.test_characters_api()
        self.test_characters_by_class()
        
        # Authentication Tests
        print("🔐 AUTHENTICATION TESTS")
        print("-" * 30)
        self.test_discord_oauth_login()
        self.test_auth_required_endpoints()
        self.test_admin_endpoints_without_auth()
        
        # Error Handling Tests
        print("⚠️  ERROR HANDLING TESTS")
        print("-" * 30)
        self.test_invalid_endpoints()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r["success"]])
        failed_tests = len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)