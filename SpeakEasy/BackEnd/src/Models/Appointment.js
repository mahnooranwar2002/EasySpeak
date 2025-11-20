var mongoes = require("mongoose");

const data = new mongoes.Schema({
  user_name: {
    type: String,
  },
  user_id: {
    type: String,
  },

  reason: {
    type: String,
  },
  email: {
    type: String,
  },
  Listner_id: {
    type: String,
  },
  Listner_name: {
    type: String,
  },
  appointment_time: {
    type: String,
  },
    date: {
    type: String,
  },
  status: {
    type: String,
  },
});
var appointment_data = mongoes.model("appointments", data);
module.exports = appointment_data;
