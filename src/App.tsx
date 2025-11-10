import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormBuilder from './pages/FormBuilder';
import FormFiller from './pages/FormFiller';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormBuilder />} />
        <Route path="/fill-form" element={<FormFiller />} />
      </Routes>
    </Router>
  );
}

export default App;
