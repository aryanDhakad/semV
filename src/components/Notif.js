import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Notif({ item, index, setNotifs, db, currentUser }) {
  return (
    <tr className="lft-border">
      <th scope="row">{item.faculty}</th>

      <td>{item.content}</td>
      <td>
        {item.isRead ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              setNotifs((prev) => {
                return prev.filter((item, id) => {
                  return id !== index;
                });
              });
              db.collection("Student")
                .doc(currentUser.email)
                .collection("Notifs")
                .doc(item.id)
                .delete();
            }}
          >
            <FontAwesomeIcon icon={["fas", "times-circle"]} />
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm mx-1"
            onClick={() => {
              setNotifs((prev) => {
                return prev.map((item, id) => {
                  if (id === index) {
                    item.isRead = true;
                    return item;
                  } else return item;
                });
              });

              db.collection("Student")
                .doc(currentUser.email)
                .collection("Notifs")
                .doc(item.id)
                .update({
                  isRead: !item.isRead,
                });
            }}
          >
            <FontAwesomeIcon icon={["fas", "bell"]} />
          </button>
        )}{" "}
      </td>
    </tr>
  );
}

export default Notif;
