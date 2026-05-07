import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import NoticesPage from "../NoticesPage";
import { AuthContext } from "@/features/auth/AuthContext";
import api from "@/api/axiosInstance";

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe("NoticesPage Component", () => {
  const mockNotices = [
    { 
      id: "n1", 
      title: "Holiday Announcement", 
      content: "School is closed tomorrow.", 
      target: "ALL", 
      author: "Admin", 
      date: "2023-10-01",
      attachment: "holiday.pdf"
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValue({ status: 200 });
    vi.spyOn(api, 'delete').mockResolvedValue({ status: 200 });
  });

  const renderNoticesPage = (userRole = "ROLE_ADMIN") => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { role: userRole } }}>
          <NoticesPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it("renders notices list correctly", async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockNotices });
    renderNoticesPage();
    
    expect(await screen.findByText("Holiday Announcement")).toBeInTheDocument();
    expect(screen.getByText(/School is closed tomorrow./i)).toBeInTheDocument();
    expect(screen.getByText("Download Attachment")).toBeInTheDocument();
  });

  it("shows posting form for Admin", async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: [] });
    renderNoticesPage("ROLE_ADMIN");
    
    expect(screen.getByText(/Post New Announcement/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Notice Title/i)).toBeInTheDocument();
  });

  it("hides posting form for Student", async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: [] });
    renderNoticesPage("ROLE_STUDENT");
    
    expect(screen.queryByText(/Post New Announcement/i)).not.toBeInTheDocument();
  });

  it("handles posting a new notice successfully", async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValueOnce({ status: 200 });
    
    renderNoticesPage("ROLE_ADMIN");
    
    fireEvent.change(screen.getByPlaceholderText(/Notice Title/i), { target: { value: "New Event" } });
    fireEvent.change(screen.getByPlaceholderText(/Write your message here.../i), { target: { value: "Event details here." } });
    
    fireEvent.click(screen.getByRole("button", { name: /Publish/i }));
    
    expect(await screen.findByText(/Notice Posted Successfully!/i)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalled();
  });

  it("handles notice deletion with confirmation", async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockNotices });
    vi.spyOn(api, 'delete').mockResolvedValueOnce({ status: 200 });
    
    renderNoticesPage("ROLE_ADMIN");
    
    const deleteBtn = await screen.findByTitle("Delete Notice");
    fireEvent.click(deleteBtn);
    // ConfirmDialog should appear
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/Are you sure you want to delete this notice/i)).toBeInTheDocument();
    
    const confirmBtn = within(dialog).getByRole("button", { name: /Delete/i });
    fireEvent.click(confirmBtn);
    
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/notices/n1");
    });
    expect(await screen.findByText(/Notice deleted successfully!/i)).toBeInTheDocument();
  });
});
