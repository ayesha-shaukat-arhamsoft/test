const { events } = require("../../../config/var");
const Notification = require("../../models/notification.model");

exports.sendNotification = async (socketInstance, notificationData) => {
  const socket = socketInstance;
  const { type, notificationTo, adminNotification } = notificationData;

  const eventName = getEventName(type);
  if (!eventName) return false;

  const payload = { data: "Some data" };

  // notifications sent to admin ( both admin's & user's )
  // myEvt-user = user event emitted to admin
  // myEvt-admin = admin's own event

  // if admin is not required to receive user notifications then below code can be
  // made conditional e.g. if(adminNotification) { socket.emit('myEvt-admin', {}) }

  socket.emit(`${eventName}-${adminNotification ? "admin" : "user"}`, {
    message: `Event Emitted (${eventName}-${
      adminNotification ? "admin" : "user"
    })`,
    payload,
  });

  // notification sent to specific user
  // myEvt-6423e536851cd873a5fdc4a1

  if (!adminNotification) {
    socket.emit(`${eventName}-${notificationTo}`, {
      message: `Event Emitted (${eventName}-${notificationTo})`,
      payload,
    });
  }

  await Notification.create(notificationData);
};

const getEventName = (type) => {
  const notificationsTypes = [...events.notifications];
  const eventName = notificationsTypes.filter((nt) => nt.type === type)[0]
    ?.name;

  if (eventName) return eventName;

  return false;
};
