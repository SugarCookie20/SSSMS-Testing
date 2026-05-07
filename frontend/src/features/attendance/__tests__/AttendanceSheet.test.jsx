import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AttendanceSheet from "../AttendanceSheet";
import api from "@/api/axiosInstance";

// Mock useNavigate and useParams
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
    useParams: () => ({ id: "123" }),
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe("AttendanceSheet Component", () => {
  const mockStudents = [
    { id: "s1", firstName: "John", lastName: "Doe", prn: "PRN001" },
    { id: "s2", firstName: "Jane", lastName: "Smith", prn: "PRN002" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValue({ status: 200 });
    vi.spyOn(api, 'put').mockResolvedValue({ status: 200 });
    vi.spyOn(api, 'delete').mockResolvedValue({ status: 200 });
  });

  const renderAttendanceSheet = () => {
    return render(
      <MemoryRouter initialEntries={["/faculty/attendance/123"]}>
        <Routes>
          <Route path="/faculty/attendance/:id" element={<AttendanceSheet />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders loading state initially", async () => {
    vi.spyOn(api, 'get').mockImplementation(() => new Promise(() => {})); // Never resolves
    renderAttendanceSheet();
    expect(screen.getByText(/Loading class list.../i)).toBeInTheDocument();
  });

  it("renders student list after successful fetch", async () => {
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes("/students")) return Promise.resolve({ data: mockStudents });
      if (url.includes("/date")) return Promise.resolve({ data: { exists: false } });
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    renderAttendanceSheet();

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(await screen.findByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("PRN001")).toBeInTheDocument();
  });

  it("toggles attendance status when status button is clicked", async () => {
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes("/students")) return Promise.resolve({ data: mockStudents });
      if (url.includes("/date")) return Promise.resolve({ data: { exists: false } });
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    renderAttendanceSheet();

    // Find John Doe's row and his status button
    const johnRow = (await screen.findByText("John Doe")).closest('div').parentElement.parentElement;
    const johnStatusBtn = within(johnRow).getByRole("button", { name: /Present/i });
    
    expect(johnStatusBtn).toHaveTextContent(/Present/i);

    fireEvent.click(johnStatusBtn);
    expect(johnStatusBtn).toHaveTextContent(/Absent/i);
    expect(johnStatusBtn).toHaveClass("bg-red-100");
  });

  it("shows success message on successful submission", async () => {
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes("/students")) return Promise.resolve({ data: mockStudents });
      if (url.includes("/date")) return Promise.resolve({ data: { exists: false } });
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    vi.spyOn(api, 'post').mockResolvedValueOnce({ status: 200 });

    renderAttendanceSheet();

    const saveBtn = await screen.findByRole("button", { name: /Save Attendance/i });
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Attendance Saved Successfully!/i)).toBeInTheDocument();
  });

  it("handles API failure when fetching students", async () => {
    vi.spyOn(api, 'get').mockRejectedValueOnce(new Error("Network Error"));
    
    renderAttendanceSheet();
    
    expect(await screen.findByText(/Failed to load student list./i)).toBeInTheDocument();
  });

  it("loads existing attendance if it exists for the selected date", async () => {
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes("/students")) return Promise.resolve({ data: mockStudents });
      if (url.includes("/date")) return Promise.resolve({ 
        data: { 
          exists: true, 
          sessionId: "sess1", 
          records: [{ studentId: "s1", status: "ABSENT" }] 
        } 
      });
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    renderAttendanceSheet();

    expect(await screen.findByText(/Attendance already marked for this date/i)).toBeInTheDocument();
    
    // Find the Absent button for John (s1)
    const absentBtn = await screen.findByRole("button", { name: /Absent/i });
    expect(absentBtn).toBeInTheDocument();
  });
});
