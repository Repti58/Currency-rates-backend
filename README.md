<h1 align="center">
Currency rates (backend)
</h1>

<h3>This web application is deployed on "Vercell" and uses the frontend deployed on "Github Pages"</h3>

  **Github (frontend):**  https://github.com/repti85/Currency-rates.git 
<br><br>

<a href="https://repti85.github.io/Currency-rates/">
<img src="img/screenshot_cut.png" width="600">
</a>

https://repti85.github.io/Currency-rates

## Implementation:
The application sends a request to the API of the Central Bank of the Russian Federation for the required date and the previous one and receives data in xml format, which it processes and converts into an array with objects, including:
- letter code,
- amount,
- Name,
- price on the requested date,
- previous date price

## Features:
**Technologies used: HTML, CSS, Bootstrap, JavaScript, React, Redux/Redux-toolkit**

