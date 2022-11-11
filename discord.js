const axios = require("axios")

module.exports = (webhook, name, url, text, error = false) => {
  //An array of Discord Embeds.
  let embeds = [
    {
      title: `${text} - ${name}`,
      color: error ? 14177041 : 5174599,
      fields: [
        {
          name: "Name",
          value: name
        },{
          name: "Url",
          value: url
        },
      ],
    },
  ];

//Stringify the embeds using JSON.stringify()
  let data = JSON.stringify({ embeds });

//Create a config object for axios, you can also use axios.post("url", data) instead
  var config = {
    method: "POST",
    url: webhook, // https://discord.com/webhook/url/here
    headers: { "Content-Type": "application/json" },
    data: data,
  };

//Send the request
  axios(config)
    .then((response) => {
      console.log("Webhook delivered successfully");
      return response;
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
}
