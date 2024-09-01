import React, { useState } from "react";
import "../global.css";
import Modal from "react-modal";
import { FileUploader } from "react-drag-drop-files";
import ReactLoading from "react-loading";
import { BiSolidError } from "react-icons/bi";
import { db } from "../appwriteConfig";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const JWT = process.env.REACT_APP_JWT;

const Upload = ({ list, setList, holder }) => {
  let subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [exist, setExist] = useState(false);
  const fileTypes = ["JPG", "PNG", "PDF", "DOC"];
  const [file, setFile] = useState(null);
  const [nfile, setNFile] = useState("");
  const [dName, setDName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState("");

  const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
  const collectionId = process.env.REACT_APP_APPWRITE_COLLECTION_ID;

  const handleChange = (file) => {
    setFile(file);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = "#f00";
  }

  const closeModal = () => {
    setIsOpen(false);
    setLoading(false);
    setExist(false);
    setFile(null); // Reset file input
    setNFile(""); // Reset document name input
    setDName(""); // Reset department selection
  };

  const getIpfsHash = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      return resData.IpfsHash;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload file to IPFS.");
    }
  };

  async function uploadDoc() {
    if (nfile === "" || dName === "" || file === null) {
      alert("All fields are mandatory");
      return;
    }
    setLoading(true);
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let monthName = monthNames[month];
    const cid = await getIpfsHash(file);
    setHash(cid);

    for (let i = 0; i < list.length; i++) {
      if (cid === list[i].cid) {
        setExist(true);
        setLoading(false);
        return;
      }
    }

    const currentDate = `${year} ${monthName}`;

    try {
      const response = await db.createDocument(
        databaseId,
        collectionId,
        "unique()",
        {
          name: nfile,
          owner: holder,
          cid: cid,
          dept: dName,
          time: currentDate,
        }
      );
      console.log("File Document written with ID: ", response.$id);
      setList([...list, { ...response, id: response.$id }]);
      alert("Document Uploaded");
    } catch (e) {
      alert("Failed to upload document. Please try again.");
      console.error("Error adding document: ", e);
    } finally {
      closeModal();
      setLoading(false);
    }
  }

  return (
    <div id="upld">
      <button className="button-68" onClick={openModal}>
        UPLOAD
      </button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)} align="center">
          UPLOAD
        </h2>
        {loading ? (
          <ReactLoading type="spokes" color="green" height={100} width={100} />
        ) : (
          <div id="inside">
            {!exist ? (
              <>
                <div id="first">
                  <input
                    autoComplete="off"
                    type="text"
                    placeholder="Enter Name of document..."
                    id="nameOfFile"
                    value={nfile}
                    onChange={(e) => setNFile(e.target.value)}
                  />
                  <select
                    id="selectOption"
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    <option value="Indian Meteorological department (IMD)">
                      Indian Meteorological department (IMD)
                    </option>
                    <option value="National center for medium range weather forecasting (NCMRWF)">
                      National center for medium range weather forecasting
                      (NCMRWF)
                    </option>
                    <option value="Indian Institute of Tropical Metereologoy (IITM) Pune">
                      Indian Institute of Tropical Metereologoy (IITM) Pune
                    </option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <FileUploader
                  handleChange={handleChange}
                  name="file"
                  types={fileTypes}
                  required
                />
                <div id="second">
                  <button
                    className="button-6"
                    id="sbmt"
                    onClick={uploadDoc}
                    disabled={loading || !nfile || !dName || !file}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <div id="inside2">
                <BiSolidError id="logo" />
                <div>
                  This file already exists,{" "}
                  <a
                    href={`https://bronze-elegant-gopher-211.mypinata.cloud/ipfs/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    click here
                  </a>{" "}
                  for preview{" "}
                </div>
                <button onClick={closeModal} className="button-6" id="error">
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Upload;
