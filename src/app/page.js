"use client";
import React, { useState, useEffect } from "react";

const checkpoints = [
  { id: 11, label: "Start" },
  { id: 1, label: "Checkpoint 1" },
  { id: 2, label: "Checkpoint 2" },
  { id: 3, label: "Checkpoint 3" },
  { id: 4, label: "Checkpoint 4" },
  { id: 5, label: "Checkpoint 5" },
  { id: 6, label: "Checkpoint 2 - 42K" },
  { id: 7, label: "Finish" },
];

const ControlPoints = () => {
  const [checkpointsData, setCheckpointsData] = useState({});
  const [pages, setPages] = useState(
    checkpoints.reduce((acc, cp) => {
      acc[cp.id] = 1; // Start each checkpoint at page 1
      return acc;
    }, {})
  );
  const [metadata, setMetadata] = useState(
    checkpoints.reduce((acc, cp) => {
      acc[cp.id] = { total: 0, totalPages: 1 }; // Initialize metadata
      return acc;
    }, {})
  );

  const fetchDataForCheckpoint = async (checkpointNumber, page) => {
    try {
      const response = await fetch(
        `https://racetrack.himalayancreatives.com/api/race-timings/?page_size=200&page1&checkpoint_number=${checkpointNumber}&page=${page}`
      );
      const data = await response.json();
      return {
        runners: data.results,
        total: data.count,
        size: 10,
      }; // Include total and size for pagination
    } catch (error) {
      console.error(`Error fetching data for checkpoint ${checkpointNumber}:`, error);
      return { runners: [], total: 0, size: 10 };
    }
  };

  const fetchAllData = async () => {
    const promises = checkpoints.map((cp) =>
      fetchDataForCheckpoint(cp.id, pages[cp.id])
    );

    const results = await Promise.all(promises);

    const organizedData = results.reduce(
      (acc, { runners, total, size }, index) => {
        const checkpointId = checkpoints[index].id;
        acc.data[checkpoints[index].label] = runners;
        acc.metadata[checkpointId] = {
          total,
          totalPages: Math.ceil(total / size),
        };
        return acc;
      },
      { data: {}, metadata: {} }
    );

    setCheckpointsData(organizedData.data);
    setMetadata((prev) => ({ ...prev, ...organizedData.metadata }));
  };

  useEffect(() => {
    fetchAllData();
  }, [pages]); // Refetch data whenever pages change

  const handlePageChange = (checkpointId, direction) => {
    setPages((prev) => ({
      ...prev,
      [checkpointId]: Math.max(prev[checkpointId] + direction, 1), // Prevent going below page 1
    }));
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-black">
      <h1 className="text-2xl font-bold text-center mb-6">Race ALL CP LOG</h1>

      <div className="overflow-x-auto min-h-screen">
        <div className="inline-flex gap-4">
          {Object.entries(checkpointsData).map(([label, runners], index) => {
            const checkpointId = checkpoints[index].id;
            const { total, totalPages } = metadata[checkpointId];
            const currentPage = pages[checkpointId];
            return (
              <div
                key={label}
                className="flex-shrink-0 bg-white shadow-md rounded-lg p-4 border min-h-screen border-gray-200 w-64"
              >
                <h3 className="text-lg font-semibold text-center mb-2">{label}</h3>
                <p className="text-sm text-center mb-2">
                  Total: {total} | Page: {currentPage} of {totalPages}
                </p>
                {runners.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">
                    No runners at this checkpoint yet.
                  </p>
                ) : (
                  <div className="overflow-y-auto">
                    <table className="w-full text-xs text-left table-fixed">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="w-1/3 px-2 py-1 border-b text-gray-600">Bib</th>
                          <th className="w-2/3 px-2 py-1 border-b text-gray-600">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runners.map((runner) => (
                          <tr key={runner.id} className="hover:bg-gray-50">
                            <td className="px-2 py-1 border-b text-center">
                              {runner.runner_details.bib}
                            </td>
                            <td className="px-2 py-1 border-b text-center">
                              {new Date(runner.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <button
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handlePageChange(checkpointId, -1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handlePageChange(checkpointId, 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ControlPoints;
