#!/usr/bin/env python3
"""
InstaClone Backend API Testing Suite
Tests all backend endpoints according to the review request
"""

import requests
import json
import sys
import os
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://socialsnap-453.preview.emergentagent.com/api"

class InstaCloneAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.user1_token = None
        self.user2_token = None
        self.user1_id = None
        self.user2_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        print("🔐 Testing User Registration...")
        
        # Test first user registration
        user1_data = {
            "email": "teste@example.com",
            "password": "senha123",
            "username": "testusuario",
            "fullName": "Usuário Teste"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=user1_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.user1_token = data["token"]
                    self.user1_id = data["user"]["id"]
                    self.log_test("User 1 Registration", True, 
                                f"User ID: {self.user1_id}, Username: {data['user']['username']}")
                else:
                    self.log_test("User 1 Registration", False, 
                                "Missing token or user in response", data)
            else:
                self.log_test("User 1 Registration", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("User 1 Registration", False, f"Exception: {str(e)}")
    
    def test_user_login(self):
        """Test user login endpoint"""
        print("🔑 Testing User Login...")
        
        login_data = {
            "email": "teste@example.com",
            "password": "senha123"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    # Verify token matches registration token
                    token_match = data["token"] == self.user1_token if self.user1_token else True
                    self.log_test("User Login", True, 
                                f"Login successful, Token match: {token_match}")
                else:
                    self.log_test("User Login", False, 
                                "Missing token or user in response", data)
            else:
                self.log_test("User Login", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
    
    def test_get_current_user(self):
        """Test get current user profile endpoint"""
        print("👤 Testing Get Current User Profile...")
        
        if not self.user1_token:
            self.log_test("Get Current User", False, "No token available from registration")
            return
        
        headers = {"Authorization": f"Bearer {self.user1_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data:
                    user = data["user"]
                    expected_fields = ["id", "email", "username", "fullName", "followers", "following", "posts"]
                    missing_fields = [field for field in expected_fields if field not in user]
                    
                    if not missing_fields:
                        self.log_test("Get Current User", True, 
                                    f"Profile retrieved: {user['username']} ({user['email']})")
                    else:
                        self.log_test("Get Current User", False, 
                                    f"Missing fields: {missing_fields}", data)
                else:
                    self.log_test("Get Current User", False, 
                                "Missing user in response", data)
            else:
                self.log_test("Get Current User", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
    
    def test_second_user_registration(self):
        """Test creating second user for follow testing"""
        print("👥 Testing Second User Registration...")
        
        user2_data = {
            "email": "teste2@example.com",
            "password": "senha123",
            "username": "testusuario2",
            "fullName": "Usuário Teste 2"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=user2_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.user2_token = data["token"]
                    self.user2_id = data["user"]["id"]
                    self.log_test("User 2 Registration", True, 
                                f"User ID: {self.user2_id}, Username: {data['user']['username']}")
                else:
                    self.log_test("User 2 Registration", False, 
                                "Missing token or user in response", data)
            else:
                self.log_test("User 2 Registration", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("User 2 Registration", False, f"Exception: {str(e)}")
    
    def test_follow_user(self):
        """Test follow user functionality"""
        print("👥 Testing Follow User...")
        
        if not self.user1_token or not self.user2_id:
            self.log_test("Follow User", False, "Missing user1 token or user2 ID")
            return
        
        headers = {"Authorization": f"Bearer {self.user1_token}"}
        
        try:
            response = self.session.post(f"{self.base_url}/users/{self.user2_id}/follow", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "isFollowing" in data:
                    if data["isFollowing"]:
                        self.log_test("Follow User", True, 
                                    f"User 1 successfully followed User 2")
                    else:
                        self.log_test("Follow User", False, 
                                    "isFollowing is False", data)
                else:
                    self.log_test("Follow User", False, 
                                "Missing expected fields in response", data)
            else:
                self.log_test("Follow User", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Follow User", False, f"Exception: {str(e)}")
    
    def test_search_users(self):
        """Test user search functionality"""
        print("🔍 Testing User Search...")
        
        if not self.user1_token:
            self.log_test("Search Users", False, "No token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user1_token}"}
        
        try:
            # Search for "teste" which should find both users
            response = self.session.get(f"{self.base_url}/users/search?q=teste", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "users" in data:
                    users = data["users"]
                    # Should find user2 (user1 is excluded from own search)
                    if len(users) >= 1:
                        found_user2 = any(user["username"] == "testusuario2" for user in users)
                        if found_user2:
                            self.log_test("Search Users", True, 
                                        f"Found {len(users)} users, including testusuario2")
                        else:
                            self.log_test("Search Users", False, 
                                        f"testusuario2 not found in results", data)
                    else:
                        self.log_test("Search Users", False, 
                                    "No users found in search", data)
                else:
                    self.log_test("Search Users", False, 
                                "Missing users in response", data)
            else:
                self.log_test("Search Users", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Search Users", False, f"Exception: {str(e)}")
    
    def test_empty_feed(self):
        """Test that feed is empty initially"""
        print("📰 Testing Empty Feed...")
        
        if not self.user1_token:
            self.log_test("Empty Feed", False, "No token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user1_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/posts/feed", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "posts" in data:
                    posts = data["posts"]
                    if len(posts) == 0:
                        self.log_test("Empty Feed", True, 
                                    "Feed is empty as expected (no posts yet)")
                    else:
                        self.log_test("Empty Feed", False, 
                                    f"Feed contains {len(posts)} posts, expected 0", data)
                else:
                    self.log_test("Empty Feed", False, 
                                "Missing posts in response", data)
            else:
                self.log_test("Empty Feed", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Empty Feed", False, f"Exception: {str(e)}")
    
    def test_empty_stories(self):
        """Test that stories are empty initially"""
        print("📖 Testing Empty Stories...")
        
        if not self.user1_token:
            self.log_test("Empty Stories", False, "No token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user1_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/stories", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "stories" in data:
                    stories = data["stories"]
                    if len(stories) == 0:
                        self.log_test("Empty Stories", True, 
                                    "Stories are empty as expected (no stories yet)")
                    else:
                        self.log_test("Empty Stories", False, 
                                    f"Stories contains {len(stories)} items, expected 0", data)
                else:
                    self.log_test("Empty Stories", False, 
                                "Missing stories in response", data)
            else:
                self.log_test("Empty Stories", False, 
                            f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Empty Stories", False, f"Exception: {str(e)}")
    
    def test_invalid_credentials(self):
        """Test error handling for invalid credentials"""
        print("🚫 Testing Invalid Credentials...")
        
        invalid_login = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=invalid_login)
            
            if response.status_code == 401:
                self.log_test("Invalid Credentials", True, 
                            "Correctly rejected invalid credentials with 401")
            else:
                self.log_test("Invalid Credentials", False, 
                            f"Expected 401, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Invalid Credentials", False, f"Exception: {str(e)}")
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("🔒 Testing Unauthorized Access...")
        
        try:
            # Try to access protected endpoint without token
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 403:
                self.log_test("Unauthorized Access", True, 
                            "Correctly rejected unauthorized access with 403")
            elif response.status_code == 401:
                self.log_test("Unauthorized Access", True, 
                            "Correctly rejected unauthorized access with 401")
            else:
                self.log_test("Unauthorized Access", False, 
                            f"Expected 401/403, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Unauthorized Access", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting InstaClone Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Test started at: {datetime.now()}")
        print("=" * 60)
        
        # Core functionality tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_second_user_registration()
        self.test_follow_user()
        self.test_search_users()
        self.test_empty_feed()
        self.test_empty_stories()
        
        # Error handling tests
        self.test_invalid_credentials()
        self.test_unauthorized_access()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\nTest completed at: {datetime.now()}")
        
        return passed == total

if __name__ == "__main__":
    tester = InstaCloneAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)