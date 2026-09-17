// Mongoose `.lean()` docs carry ObjectId/Date instances, which aren't valid
// props for Client Components. JSON round-tripping converts both to plain
// strings (ObjectId/Date both define toJSON), which is all these need.
export function toPlain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
