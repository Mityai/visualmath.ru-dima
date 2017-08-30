export default function loadInfo() {
  console.info('loadInfo')
  return new Promise((resolve) => {
    resolve({
      message: 'Это сообщение пришло с API сервера',
      time: Date.now()
    });
  });
}
