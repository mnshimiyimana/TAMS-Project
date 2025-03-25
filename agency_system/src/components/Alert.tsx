import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-600';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-600';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`border rounded px-4 py-2 flex items-start gap-3 ${getAlertStyles()} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className='text-sm'>{message}</div>
    </div>
  );
};

export default Alert;