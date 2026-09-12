import { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import registry from "../topicsRegistry.js";

export default function TopicDetail() {
  const { classId, subjectId, topicId } = useParams();
  const Component = registry[classId]?.[topicId];

  if (!Component) {
    return (
      <div className="topic-not-found">
        <p>Couldn't find that topic.</p>
        <Link to={`/classes/${classId}/${subjectId}`}>← Back to subject</Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="topic-loading">Loading visualizer…</div>}>
      <Component />
    </Suspense>
  );
}