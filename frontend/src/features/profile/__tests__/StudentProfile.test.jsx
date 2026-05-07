import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StudentProfile from "../StudentProfile";
import api from "@/api/axiosInstance";

describe("StudentProfile Component", () => {
  const mockProfile = {
    firstName: "Jane",
    middleName: "M",
    lastName: "Doe",
    email: "jane@example.com",
    department: "Architecture",
    currentYear: 3,
    cgpa: 8.9,
    overallAttendance: 85,
    dob: "2002-01-01",
    prn: "PRN123",
    grNo: "GR001",
    abcId: "ABC123",
    coaEnrollmentNo: "COA123",
    aadharNo: "123456789012",
    phoneNumber: "9876543210",
    parentPhoneNumber: "9876543211",
    address: "123 Main St, Mumbai",
    fathersName: "John Doe",
    mothersName: "Mary Doe",
    gender: "Female",
    religion: "Hindu",
    caste: "General"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockProfile });
    vi.spyOn(api, 'post').mockResolvedValue({ status: 200 });
  });

  const renderProfile = () => {
    return render(
      <MemoryRouter>
        <StudentProfile />
      </MemoryRouter>
    );
  };

  it("renders personal details correctly", async () => {
    renderProfile();
    // Use getAll and pick the header one
    const names = await screen.findAllByText("Jane M Doe");
    expect(names[0]).toBeInTheDocument();
    
    expect(screen.getByText("8.9")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("PRN123")).toBeInTheDocument();
  });

  it("handles password change form", async () => {
    const user = userEvent.setup();
    renderProfile();
    
    // Wait for component to load
    await screen.findAllByText("Jane M Doe");
    
    // Fill form
    const currentPass = screen.getByLabelText(/Current Password/i);
    const newPass = screen.getByLabelText("New Password");
    const confirmPass = screen.getByLabelText(/Confirm New Password/i);
    
    await user.type(currentPass, "oldpass123");
    await user.type(newPass, "newpass123");
    await user.type(confirmPass, "newpass123");
    
    const submitBtn = screen.getByRole("button", { name: /Change Password/i });
    await user.click(submitBtn);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "oldpass123",
        newPassword: "newpass123"
      });
    });
    
    expect(await screen.findByText(/Password changed successfully!/i)).toBeInTheDocument();
  });
});
