"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Member {
  memberId: string;
  memberType: string;
  name: string;
}

interface Subcommittee {
  _id: string;
  name: string;
  members: Member[];
}

const Subcommittees: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);

  useEffect(() => {
    const fetchSubcommittees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/subcommittees');
        setSubcommittees(response.data);
      } catch (error) {
        console.error('Error fetching subcommittees:', error);
      }
    };

    fetchSubcommittees();
  }, []);

  return (
    <div className="p-4">
      {subcommittees.map((subcommittee) => (
        <div key={subcommittee._id} className="subcommittee border-b border-gray-300 pb-4 mb-4">
          <h2 className="text-xl font-bold mb-2">{subcommittee.name}</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subcommittee.members.map((member) => (
                <tr key={member.memberId}>
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.memberType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Subcommittees;
