import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Login from "../Login";
import { AuthProvider } from "../AuthContext";
import api from "@/api/axiosInstance";

// Mock the navigate function
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for initial auth check
    vi.spyOn(api, 'get').mockRejectedValue({ response: { status: 401 } });
    vi.spyOn(api, 'post').mockResolvedValue({ status: 200 });
  });

  const renderLogin = async () => {
    const utils = render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/Connecting to SSSMS Server/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
    return utils;
  };

  it("renders login form correctly", async () => {
    await renderLogin();
    
    expect(screen.getByRole("heading", { name: /^Sign In$/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Sign in$/ })).toBeInTheDocument();
  });

  it("changes selected role when role buttons are clicked", async () => {
    await renderLogin();
    
    const facultyButton = screen.getByRole("button", { name: /Faculty/i });
    const adminButton = screen.getByRole("button", { name: /Admin/i });
    
    fireEvent.click(facultyButton);
    expect(facultyButton).toHaveClass("bg-blue-600");
    
    fireEvent.click(adminButton);
    expect(adminButton).toHaveClass("bg-blue-600");
  });

  it("shows error message on failed login (401)", async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce({ 
      response: { status: 401, data: "Invalid Credentials" } 
    });
    
    await renderLogin();
    
    const emailInput = await screen.findByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    
    expect(await screen.findByText(/Invalid Credentials/i)).toBeInTheDocument();
  });

  it("handles successful login and redirects based on role", async () => {
    // 1. Mock Login Success
    vi.spyOn(api, 'post').mockResolvedValueOnce({ status: 200 });
    // 2. Mock Get Me Success - using mockResolvedValue so it persists across multiple calls
    vi.spyOn(api, 'get').mockResolvedValue({ 
      data: { id: 1, email: "student@example.com", role: "ROLE_STUDENT" } 
    });
    
    await renderLogin();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "student@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/student/dashboard");
    });
  });

  it("shows role mismatch error if user role doesn't match selected role", async () => {
    // Mock Login Success but return ADMIN role when STUDENT was selected
    vi.spyOn(api, 'post').mockResolvedValueOnce({ status: 200 });
    // Use mockImplementation to handle multiple calls (initial check + login call)
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url === "/auth/me") {
        return Promise.resolve({ data: { id: 1, email: "admin@example.com", role: "ROLE_ADMIN" } });
      }
      return Promise.reject({ response: { status: 401 } });
    });
    
    await renderLogin();
    
    // Default role is student
    const emailInput = await screen.findByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    
    expect(await screen.findByText(/Invalid credentials for Student role/i)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("displays loading state during submission", async () => {
    vi.spyOn(api, 'post').mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    await renderLogin();
    
    fireEvent.change(await screen.findByLabelText(/Email/i), { target: { value: "test@test.com" } });
    fireEvent.change(await screen.findByLabelText(/Password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    
    expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Signing in.../i })).toBeDisabled();
  });
});
