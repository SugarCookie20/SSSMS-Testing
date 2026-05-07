import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserProfile from "../UserProfile";
import api from "@/api/axiosInstance";

const mockUser = { role: "FACULTY", email: "john@example.com" };
vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

describe("UserProfile Component", () => {
  const mockProfile = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "FACULTY",
    phone: "1234567890",
    designation: "Professor",
    department: "Architecture",
    qualification: "M.Arch",
    photoUrl: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockProfile });
  });

  it("renders profile details correctly", async () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );
    
    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Professor/i)).toBeInTheDocument();
    expect(screen.getByText(/Architecture/i)).toBeInTheDocument();
  });

  it("shows default user icon when no profile photo is present", async () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );
    
    // Check for the User icon from lucide-react
    // It should be rendered inside the profile photo container
    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    const photoContainer = screen.getByText(/John Doe/i).closest('.bg-white').querySelector('.rounded-full');
    expect(photoContainer).toBeInTheDocument();
    expect(photoContainer.querySelector('svg')).toBeInTheDocument();
  });
});
