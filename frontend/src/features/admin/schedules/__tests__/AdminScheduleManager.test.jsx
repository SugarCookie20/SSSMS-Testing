import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AdminScheduleManager from "../AdminScheduleManager";
import api from "@/api/axiosInstance";

describe("AdminScheduleManager Component", () => {
  const mockScheduleStatus = [
    { 
      year: "FIRST_YEAR", 
      timetable: true, timetableFile: "tt1.pdf",
      examSchedule: true, examScheduleFile: "ex1.pdf",
      collegeCalendar: true, collegeCalendarFile: "cal1.pdf",
      academicSchedule: true, academicScheduleFile: "ac1.pdf"
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValue({ status: 200 });
    vi.spyOn(api, 'delete').mockResolvedValue({ status: 200 });
  });

  const renderManager = () => {
    return render(
      <MemoryRouter>
        <AdminScheduleManager />
      </MemoryRouter>
    );
  };

  it("renders correctly", async () => {
    api.get.mockImplementation(async (url) => {
      if (url.includes("/exams/classes")) return { data: ["FIRST_YEAR"] };
      if (url.includes("/schedules/status")) return { data: mockScheduleStatus };
      return { data: [] };
    });

    renderManager();
    expect(await screen.findByRole("heading", { name: /Schedule Manager/i })).toBeInTheDocument();
    expect(await screen.findByText(/Published Class Timetables/i)).toBeInTheDocument();
    const yearsFound = await screen.findAllByText("First Year");
    expect(yearsFound.length).toBeGreaterThan(0);
  });
});
