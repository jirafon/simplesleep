import React, { useState } from 'react';
import DemoModal from './DemoModal';
import SurveyModal from './SurveyModal';

const App = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const handleDemoModalOpen = () => setIsDemoModalOpen(true);
  const handleDemoModalClose = () => setIsDemoModalOpen(false);

  const handleSurveyModalOpen = () => setIsSurveyModalOpen(true);
  const handleSurveyModalClose = () => setIsSurveyModalOpen(false);

  return (
    <div>
      <button onClick={handleDemoModalOpen}>Abrir Demo Modal</button>

      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => {
          handleDemoModalClose();
          handleSurveyModalOpen(); // Abrir SurveyModal cuando se cierra DemoModal
        }}
      />

      <SurveyModal
        isOpen={isSurveyModalOpen}
        onClose={handleSurveyModalClose}
      />
    </div>
  );
};

export default App;
