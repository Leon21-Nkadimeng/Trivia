export async function submitTrivia(trivia) {
  
    const API_URL = 'http://localhost:7676/trivias/create';
    console.log(trivia);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-type":"application/json"
      },
      body:JSON.stringify(trivia)
    });

    const data = await response.json();

    return data;
}
