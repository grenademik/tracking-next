"use client";
import React, { useState, useEffect } from "react";


const checkpoints = [
    { id: 11, label: "Start" },
    { id: 6, label: "Checkpoint 2" },
    { id: 5, label: "Checkpoint 3/5" },
    { id: 7, label: "Finish" },
  ]; // Specified checkpoints

const ControlPoints = () => {
  const [checkpointsData, setCheckpointsData] = useState({});


  useEffect(() => {
    const fetchDataForCheckpoint = async (checkpointNumber) => {
      try {
        const response = await fetch(
          `https://racetrack.himalayancreatives.com/api/race-timings/?size=999&checkpoint_number=${checkpointNumber}`
        );
        const data = await response.json();
        return data.results; // Fetch all results
      } catch (error) {
        console.error(`Error fetching data for checkpoint ${checkpointNumber}:`, error);
        return [];
      }
    };

    const fetchAllData = async () => {
      const promises = checkpoints.map((cp) =>
        fetchDataForCheckpoint(cp.id)
      );

      const results = await Promise.all(promises);

      const organizedData = results.reduce((acc, runners, index) => {
        const checkpoint = checkpoints[index];
        const checkpointLabel = checkpoint.label;

        if (
          ["Start", "Checkpoint 3/5", "Finish"].includes(
            checkpointLabel
          )
        ) {
          // Filter only 42K runners for Start, CP1, CP5, and Finish
          acc[checkpointLabel] = runners.filter(
            (runner) => runner.runner_details.category === "21K"
          );
        } else {
          // Keep all runners for CP2, CP3, and CP4
          acc[checkpointLabel] = runners;
        }

        return acc;
      }, {});

      setCheckpointsData(organizedData);
    };

    fetchAllData();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-black">
      <h1 className="text-2xl font-bold text-center mb-6">Race 21K</h1>

      {/* Horizontal Scrolling Wrapper */}
      <div className="overflow-x-auto min-h-screen">
        <div className="inline-flex gap-4">
          {Object.entries(checkpointsData).map(([label, runners]) => (
            <div
              key={label}
              className="flex-shrink-0 bg-white shadow-md rounded-lg p-4 border min-h-screen border-gray-200 w-64"
            >
              <h3 className="text-lg font-semibold text-center mb-4">{label}</h3>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPoints;
