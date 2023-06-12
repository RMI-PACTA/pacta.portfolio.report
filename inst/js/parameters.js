window.addEventListener('load', (event) => {
    Object.keys(data_parameters).forEach(key => document.querySelectorAll("#" + key).forEach(el => el.innerHTML = data_parameters[key]));
  });
