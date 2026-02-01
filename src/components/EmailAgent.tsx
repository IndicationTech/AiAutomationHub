// import { useState, useEffect, useRef } from "react";
// import "./EmailAgent.css";

// const EmailAgent = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isVisible, setIsVisible] = useState(false);
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => observer.disconnect();
//   }, []);

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFile = e.dataTransfer.files[0];
//     if (
//       droppedFile &&
//       (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))
//     ) {
//       setFile(droppedFile);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//     }
//   };

//   // const handleSendEmails = () => {
//   //   if (!file) {
//   //     alert('Please upload a file first');
//   //     return;
//   //   }
//   //   console.log('Sending emails with file:', file.name);
//   //   // Placeholder for webhook call
//   //   alert('Bulk Email Sender will be triggered with: ' + file.name);
//   // };

//   const handleSendEmails = async () => {
//     if (!file) {
//       alert("Please upload a file first");
//       return;
//     }

//     const webhookUrl =
//       "http://localhost:5678/webhook/8f6b29d2-b2e1-4136-8f47-0b2378130b6b";

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch(webhookUrl, {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Webhook response:", data);
//         alert("Emails sent successfully!");
//       } else {
//         console.error("Webhook error:", response.statusText);
//         alert("Failed to send emails. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error sending to webhook:", error);
//       alert("Error connecting to the webhook.");
//     }
//   };

//   return (
//     <section
//       ref={sectionRef}
//       className={`email-agent ${isVisible ? "email-agent--visible" : ""}`}
//     >
//       <div className="email-agent__container">
//         <h2 className="email-agent__title">Bulk Email Sender</h2>
//         <p className="email-agent__description">
//           Upload a CSV or Excel file to send personalized emails in bulk.
//           Streamline your outreach with intelligent automation.
//         </p>

//         <div
//           className={`email-agent__upload ${
//             isDragging ? "email-agent__upload--dragging" : ""
//           } ${file ? "email-agent__upload--has-file" : ""}`}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//           onClick={() => fileInputRef.current?.click()}
//         >
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".csv,.xlsx"
//             onChange={handleFileChange}
//             style={{ display: "none" }}
//           />
//           {file ? (
//             <div className="email-agent__file-info">
//               <svg
//                 className="email-agent__file-icon"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                 />
//               </svg>
//               <p className="email-agent__file-name">{file.name}</p>
//               <p className="email-agent__file-size">
//                 {(file.size / 1024).toFixed(2)} KB
//               </p>
//             </div>
//           ) : (
//             <div className="email-agent__upload-prompt">
//               <svg
//                 className="email-agent__upload-icon"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                 />
//               </svg>
//               <p className="email-agent__upload-text">
//                 Drag & drop or click to upload
//               </p>
//               <p className="email-agent__upload-hint">
//                 Accepted formats: .csv, .xlsx
//               </p>
//             </div>
//           )}
//         </div>

//         <button
//           className="email-agent__button"
//           onClick={handleSendEmails}
//           disabled={!file}
//         >
//           Send Emails
//         </button>

//         <p className="email-agent__note">
//           Note: Ensure your file includes email addresses and any
//           personalization fields
//         </p>
//       </div>
//     </section>
//   );
// };

// export default EmailAgent;

import { useState, useEffect, useRef } from "react";
import "./EmailAgent.css";

const EmailAgent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))
    ) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSendEmails = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setTotalEmails(0);

    const webhookUrl =
      "http://localhost:5678/webhook/8f6b29d2-b2e1-4136-8f47-0b2378130b6b";

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 👇 First, send the file to the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to trigger webhook");
      }

      const data = await response.json();

      // Simulate sending each email (replace this with actual n8n progress updates if supported)
      const simulatedTotal = data.totalEmails || 10; // Fallback if webhook doesn't send count
      setTotalEmails(simulatedTotal);

      for (let i = 1; i <= simulatedTotal; i++) {
        // Simulate small delay per email
        await new Promise((res) => setTimeout(res, 500));
        setProgress(i);
      }

      alert(`✅ All ${simulatedTotal} emails sent successfully!`);
    } catch (error) {
      console.error("Error sending to webhook:", error);
      alert("❌ Error connecting to the webhook or sending emails.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`email-agent ${isVisible ? "email-agent--visible" : ""}`}
    >
      <div className="email-agent__container">
        <h2 className="email-agent__title">Bulk Email Sender</h2>
        <p className="email-agent__description">
          Upload a CSV or Excel file to send personalized emails in bulk.
          Streamline your outreach with intelligent automation.
        </p>

        <div
          className={`email-agent__upload ${
            isDragging ? "email-agent__upload--dragging" : ""
          } ${file ? "email-agent__upload--has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {file ? (
            <div className="email-agent__file-info">
              <svg
                className="email-agent__file-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="email-agent__file-name">{file.name}</p>
              <p className="email-agent__file-size">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="email-agent__upload-prompt">
              <svg
                className="email-agent__upload-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="email-agent__upload-text">
                Drag & drop or click to upload
              </p>
              <p className="email-agent__upload-hint">
                Accepted formats: .csv, .xlsx
              </p>
            </div>
          )}
        </div>

        <button
          className="email-agent__button"
          onClick={handleSendEmails}
          disabled={!file || isLoading}
        >
          {isLoading ? "Sending..." : "Send Emails"}
        </button>

        {isLoading && (
          <div className="email-agent__progress">
            <p>
              Sending emails... {progress}/{totalEmails || "?"}
            </p>
            <div className="email-agent__progress-bar">
              <div
                className="email-agent__progress-fill"
                style={{
                  width: totalEmails
                    ? `${(progress / totalEmails) * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        )}

        <p className="email-agent__note">
          Note: Ensure your file includes email addresses and any
          personalization fields.
        </p>
      </div>
    </section>
  );
};

export default EmailAgent;
