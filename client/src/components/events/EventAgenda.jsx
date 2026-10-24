
import { FiPlus, FiTrash2, FiList } from "react-icons/fi";
import { EVENT_INPUT_CLASS } from "../../utils/eventHelpers";

const EventAgenda = ({ agenda = [], onChange }) => {
  const handleTopicChange = (index, value) => {
    const updated = agenda.map((topic, i) =>
      i === index ? value : topic
    );

    onChange(updated);
  };

  const handleAddTopic = () => {
    if (agenda.length >= 20) return;

    onChange([...agenda, ""]);
  };

  const handleRemoveTopic = (index) => {
    onChange(
      agenda.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <FiList className="text-indigo-400" />
          Learning Agenda
        </label>

        <button
          type="button"
          onClick={handleAddTopic}
          disabled={agenda.length >= 20}
          className="flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200 disabled:opacity-40 transition-colors"
        >
          <FiPlus size={17} />
          Add Topic
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Add up to 20 topics participants will learn.
      </p>

      <div className="space-y-3">
        {agenda.map((topic, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
          >
            <span className="w-7 shrink-0 text-center text-xs font-semibold text-indigo-300">
              {index + 1}.
            </span>

            <input
              type="text"
              value={topic}
              onChange={(e) =>
                handleTopicChange(index, e.target.value)
              }
              maxLength={200}
              placeholder={`Learning topic ${index + 1}`}
              aria-label={`Learning topic ${index + 1}`}
              className={EVENT_INPUT_CLASS}
            />

            <button
              type="button"
              onClick={() => handleRemoveTopic(index)}
              aria-label={`Remove topic ${index + 1}`}
              title="Remove topic"
              className="shrink-0 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {agenda.length === 0 && (
        <p className="text-sm text-gray-500 bg-white/5 border border-white/10 rounded-xl p-4">
          No agenda topics added yet. Click Add Topic.
        </p>
      )}

      <p className="text-xs text-gray-500 text-right">
        {agenda.length}/20 topics
      </p>
    </div>
  );
};

export default EventAgenda;
