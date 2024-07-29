
import MemberSearch from './components/MemberSearch';
import Subcommittees from "./components/Allcommittees";
import AddAssemblyMemberForm from "./components/AddAssemblyMemberForm";
import AddGovernmentAppointeeForm from "./components/AddGovernmentAppointeeForm";

export default function Home() {
  return (
    
    <main className="min-h-screen bg-white text-black">
      <h1>Subcommittees Management</h1>
      <AddAssemblyMemberForm />
      <AddGovernmentAppointeeForm />
      <MemberSearch />
      <Subcommittees />
    </main>

  );
}
