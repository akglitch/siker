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
    const getSubcommittees = async () => {
      try {
        const response = await axios.get('/api/subcommittees');
        setSubcommittees(response.data);
      } catch (error) {
        console.error('Error fetching subcommittees:', error);
      }
    };

    getSubcommittees();
  }, []);

  return (
    <div>
      {subcommittees.map((subcommittee) => (
        <div key={subcommittee._id} className="subcommittee">
          <h2>{subcommittee.name}</h2>
          <ul>
            {subcommittee.members.map((member) => (
              <li key={member.memberId}>{member.name} ({member.memberType})</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Subcommittees;
