import { Recruiter } from '../types';

interface Props {
    recruiters: Recruiter[];
}

export function RecruiterTable({ recruiters }: Props) {
    return (
        <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recruiter Data</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left font-semibold">Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Email</th>
                            <th className="px-4 py-3 text-left font-semibold">Reach Out Count</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Last Contact Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Role</th>
                            <th className="px-4 py-3 text-left font-semibold">Company</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recruiters.map((recruiter, index) => (
                            <tr
                                key={index}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-3">{recruiter.Name}</td>
                                <td className="px-4 py-3">{recruiter.Email}</td>
                                <td className="px-4 py-3">{recruiter.ReachOutCount}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        recruiter.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        recruiter.Status === 'Sent' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {recruiter.Status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{recruiter.LastContactDate || '-'}</td>
                                <td className="px-4 py-3">{recruiter.Role}</td>
                                <td className="px-4 py-3">{recruiter.Company}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
