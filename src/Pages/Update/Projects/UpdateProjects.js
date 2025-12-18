import React from 'react'
import AddProject from '../../AddNew/Project/AddProject'
import useAuthRedirect from '../../../Components/Auth/useAuthRedirect';

export default function UpdateProjects({ viewOnly = false }) {
  useAuthRedirect();
  return (
    <AddProject viewOnly={viewOnly} />
  )
}
