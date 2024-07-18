import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadScreen from './screens/UploadScreen';
import AnnotationScreen from './screens/AnnotationScreen';
import ImageListScreen from './screens/ImageListScreen';
import { Login } from './screens/Login';
import PrivateRoutes from './config/PrivateRoutes';
import { DashboardScreen } from './screens/DashboardScreen';
import ArtifactsScreen from './screens/ArtifactsScreen';
import RipenessStatsScsreen from './screens/RipenessStatsScsreen';
import Base from './layout/Base';
import { Merge } from './screens/Merge';



class App extends React.Component {

  

  render() {
    return (
      <div className="App">
        <Router>
          <Routes>

            <Route path='/' element={<Login />} />
            <Route element={<PrivateRoutes/>}>
            <Route element={<Base/>}>
              <Route path='/merge' element={<Merge />} />
              <Route path='/dashboard-screen' element={<DashboardScreen />} />
              <Route path='/annotation-screen' element={<AnnotationScreen />} />
              <Route path='/upload-screen' element={<UploadScreen />} />
              <Route path='/images-screen' element={<ImageListScreen />} />
              <Route path='/artifacts-screen' element={<ArtifactsScreen />} />
              <Route path='/ripeness-stats-screen/:ripeness' element={<RipenessStatsScsreen />} />
            </Route>
            </Route>
          </Routes>
        </Router>

      </div>
    );
  }
}

export default App;