"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { IAssemblyMember, IGovernmentAppointee, ISubcommittee } from '../types';

const subcommittees = ['Travel', 'Revenue', 'Transport'];

const AddMemberToSubcommitteeForm: React.FC = () => {
  const [assemblyMembers, setAssemblyMembers] = useState<IAssemblyMember[]>([]);
  const [governmentAppointees, setGovernmentAppointees] = useState<IGovernmentAppointee[]>([]);
  const [selectedSubcommittee, setSelectedSubcommittee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<
    Array<{ memberType: 'AssemblyMember' | 'GovernmentAppointee'; member: IAssemblyMember | IGovernmentAppointee }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const assemblyMembersRes = await axios.get('http://localhost:3000/api/assemblymembers');
      const governmentAppointeesRes = await axios.get('http://localhost:3000/api/governmentappointees');

      setAssemblyMembers(assemblyMembersRes.data);
      setGovernmentAppointees(governmentAppointeesRes.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = [
      ...assemblyMembers
        .filter((member) => member.contact.includes(searchQuery))
        .map((member) => ({ memberType: 'AssemblyMember' as const, member })),
      ...governmentAppointees
        .filter((member) => member.contact.includes(searchQuery))
        .map((member) => ({ memberType: 'GovernmentAppointee' as const, member })),
    ];
    setFilteredMembers(filtered);
  }, [searchQuery, assemblyMembers, governmentAppointees]);

  const handleAddMember = async (memberId: string, memberType: 'AssemblyMember' | 'GovernmentAppointee') => {
    try {
      await axios.post('http://localhost:3000/api/addmember', {
        subcommitteeName: selectedSubcommittee,
        memberId,
        memberType,
      });
      alert('Member added to Subcommittee successfully');
    } catch (error) {
      alert('Error adding Member to Subcommittee');
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded mb-4">
      <h2 className="text-xl font-bold mb-4">Add Member to Subcommittee</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Subcommittee</label>
        <select
          value={selectedSubcommittee}
          onChange={(e) => setSelectedSubcommittee(e.target.value)}
          required
          className="border p-2 w-full"
        >
          <option value="">Select Subcommittee</option>
          {subcommittees.map((subcommittee) => (
            <option key={subcommittee} value={subcommittee}>
              {subcommittee}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Search Member by Contact</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div>
        {filteredMembers.map(({ memberType, member }) => (
          <div key={member._id} className="flex justify-between items-center border-b py-2">
            <div>
              <p>Name: {member.name}</p>
              <p>Contact: {member.contact}</p>
              <p>Type: {memberType}</p>
            </div>
            <button
              onClick={() => handleAddMember(member._id, memberType)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add to {selectedSubcommittee}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddMemberToSubcommitteeForm;
