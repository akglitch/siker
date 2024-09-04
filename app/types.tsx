// Assembly Member Type
export interface IAssemblyMember {
  _id:any;
  name: string;
  electoralArea: string;
  contact: string;
  gender: 'Male' | 'Female';
  isConvener: boolean;

}

// Government Appointee Type
export interface IGovernmentAppointee {
  _id:any;
  name: string;
  electoralArea: string;
  contact: string;
  gender: 'Male' | 'Female';
  isConvener: boolean;

}

// Subcommittee Member Type
export interface ISubcommitteeMember {
  memberId: any;
  memberType: 'AssemblyMember' | 'GovernmentAppointee';
  name: string;
}

// Subcommittee Type
export interface ISubcommittee {
  _id: any;
  name: string;
  members: ISubcommitteeMember[];
}

