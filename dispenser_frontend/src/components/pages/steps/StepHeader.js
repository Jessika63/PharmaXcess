import React from 'react';
import config from '../../../config';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers';

function StepHeader({ steps, currentStepIndex }) {
    return (
        <div className="w-full flex flex-col items-center py-4">
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-96 h-24 mb-4" />
            <div className="flex space-x-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2
                            ${step.completed ? 'bg-green-500 border-green-500' : index === currentStepIndex ? 'bg-blue-500 border-blue-500' : 'bg-gray-300 border-gray-400'}
                        `}>
                            {step.completed ? '✓' : index + 1}
                        </div>
                        <span className="ml-2">{step.label}</span>
                        {index < steps.length - 1 && <div className="w-8 h-1 bg-gray-300 mx-2"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StepHeader;
