import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import { db } from "../firebase";
// import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "./Loader";

function Defaulters() {
  let item = localStorage.getItem("quizInfo");
  item = JSON.parse(item);

  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [defaulter, setDefaulter] = useState("def");
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      await db
        .collection("quizInfo")
        .doc(item.quizUUID)
        .collection("Defaulters")
        .get()
        .then((defaulters) => {
          let defaultersList = [];
          defaulters.forEach((defaulter) => {
            defaultersList.push(defaulter.data());
          });
          setDefaulters(defaultersList);
          setLoading(false);
        });
    }

    getData();
  }, [item.quizUUID]);

  useEffect(() => {
    async function getImage() {
      setLoading(true);
      await db
        .collection("quizInfo")
        .doc(item.quizUUID)
        .collection("Defaulters")
        .doc(defaulter)
        .collection("Images")
        .get()
        .then((snapshot) => {
          let data = snapshot.docs.map((doc) => doc.data().src);

          setImages([...data]);
        });
      setLoading(false);
    }

    getImage();
  }, [defaulter, item.quizUUID]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="row p-2">
        <div className="col-3 px-2 rgt-border">
          <h1>Defaulters</h1>
          <Link to="/create-quiz" className="m-3">
            {" "}
            Exit{" "}
          </Link>
          {defaulters.length === 0 && !loading && (
            <Alert variant="danger">No defaulters found</Alert>
          )}

          {defaulters.map((item, index) => {
            return (
              <div key={index} className="lft-border my-1">
                <h3>{item.Name}</h3>
                <p>{item.Email}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setDefaulter(item.Email)}
                >
                  Show <FontAwesomeIcon icon={["fas", "eye"]} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="col-9 d-flex flex-wrap">
          {images.map((image, index) => {
            return (
              <div key={index} className="m-2">
                <img src={image} alt="nf" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Defaulters;
