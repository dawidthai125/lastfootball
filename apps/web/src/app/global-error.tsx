'use client';

export default function GlobalError() {
  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          padding: '4rem 1rem',
          background: '#02040a',
          color: '#f2f2f2',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1>Coś poszło nie tak</h1>
        <p>Spróbuj jeszcze raz za chwilę.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </button>
      </body>
    </html>
  );
}
