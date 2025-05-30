const profaneWords = ['kerfuffle', 'sharbert', 'fornax'];

export function replaceProfaneWords(words: string): string {
  const split = words.split(' ');
  for (let i = 0; i < split.length; i++) {
    if (profaneWords.includes(split[i].toLowerCase())) {
      split[i] = '****';
    }
  }
  return split.join(' ');
}
