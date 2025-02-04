// interface fragments {}

interface message {
  message: { fragments: Array<Object> };
}

export default function (message: message) {
  console.log(message);
  // console.log(message.message);

  for (let index = 0; index < message.message.fragments.length; index++) {
    const fragment = message.message.fragments[index];

    // console.log(fragment);

  }

  return message;
}
