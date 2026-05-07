import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StudentResults from "../StudentResults";
import api from "@/api/axiosInstance";

describe("StudentResults Component", () => {
  const mockSgpaResults = [
    { id: 1, semester: 1, sgpa: 8.5, cgpa: 8.5, status: "PASS", resultDate: "2023-12-01T00:00:00Z" },
    { id: 2, semester: 2, sgpa: 9.0, cgpa: 8.75, status: "PASS", resultDate: "2024-06-01T00:00:00Z" }
  ];

  const mockAssessments = [
    { id: 1, subjectName: "Design", subjectCode: "AR101", examType: "INTERNAL_1", obtained: 40, max: 50 },
    { id: 2, subjectName: "Design", subjectCode: "AR101", examType: "INTERNAL_2", obtained: 45, max: 50 }
  ];

  const mockArchivedYears = ["FIRST_YEAR"];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url.includes("/student/archived-years")) return Promise.resolve({ data: mockArchivedYears });
      if (url.includes("/student/my-results")) return Promise.resolve({ data: mockSgpaResults });
      if (url.includes("/student/my-assessments")) return Promise.resolve({ data: mockAssessments });
      return Promise.resolve({ data: [] });
    });
  });

  const renderResults = () => {
    return render(
      <MemoryRouter>
        <StudentResults />
      </MemoryRouter>
    );
  };

  it("renders SGPA results correctly", async () => {
    renderResults();
    expect(await screen.findByText(/Academic Performance/i)).toBeInTheDocument();
    
    expect(await screen.findByText("Semester 1")).toBeInTheDocument();
    expect(screen.getAllByText("8.50")[0]).toBeInTheDocument();
    expect(screen.getByText("Semester 2")).toBeInTheDocument();
    expect(screen.getByText("9.00")).toBeInTheDocument();
  });

  it("displays and toggles subject assessments", async () => {
    const user = userEvent.setup();
    renderResults();
    
    const subjectHeader = await screen.findByText("Design");
    expect(subjectHeader).toBeInTheDocument();
    expect(screen.getByText("AR101")).toBeInTheDocument();
    
    await user.click(subjectHeader);
    
    expect(await screen.findByText("INTERNAL_1")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("80.0%")).toBeInTheDocument();
  });

  it("handles archived years filtering", async () => {
    const user = userEvent.setup();
    renderResults();
    
    const archiveBtn = await screen.findByText(/First Year/i);
    expect(archiveBtn).toBeInTheDocument();
    
    await user.click(archiveBtn);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining("year=FIRST_YEAR"));
    });
    
    expect(screen.getByText(/Viewing archived data from/i)).toBeInTheDocument();
  });

  it("shows empty states when no data is returned", async () => {
    api.get.mockResolvedValue({ data: [] });
    renderResults();
    
    expect(await screen.findByText(/No semester results declared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No assessment marks uploaded yet/i)).toBeInTheDocument();
  });
});
