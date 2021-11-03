import React from "react";

function Notif({ item, index, setNotifs, db, currentUser }) {
  return (
    <tr className="shadow rounded">
      <th scope="row">{index + 1}</th>
      <td>{item.faculty}</td>
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
            X
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
            <i class="fa fa-bell"></i>
          </button>
        )}{" "}
      </td>
    </tr>
  );
}

export default Notif;
