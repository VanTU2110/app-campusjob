import { useStudent } from '@/contexts/StudentContext';
import {
  getListPageJobBySchedule,
  getListPageJobBySkill
} from '@/service/jobService';
import { JobItem } from '@/types/job';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import JobCard from './JobCard';

export const JobSuggestions = () => {
  const { student } = useStudent();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!student) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const pageSize = 20;
        const page = 1;

        const skillPromises = student.data.listSkill?.map(skill =>
          getListPageJobBySkill({
            pageSize,
            page,
            skillUuid: skill.skill.uuid,
          })
        ) || [];

        const schedulePromises = student.data.availabilities?.map(a =>
          getListPageJobBySchedule({
            pageSize,
            page,
            dayofWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })
        ) || [];

        const skillResponses = await Promise.all(skillPromises);
        const scheduleResponses = await Promise.all(schedulePromises);

        const skillJobs = skillResponses.flatMap(res => res.data.items);
        const scheduleJobs = scheduleResponses.flatMap(res => res.data.items);

        const skillJobMap = new Map(skillJobs.map(job => [job.uuid, job]));
        const matchedJobs = scheduleJobs.filter(job => skillJobMap.has(job.uuid));

        const uniqueJobs = Array.from(
          new Map(matchedJobs.map(job => [job.uuid, job])).values()
        );

        setJobs(uniqueJobs);
      } catch (error) {
        console.error('Lỗi khi gợi ý việc làm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [student]);

  return (
    <ScrollView className="p-4">
      <Text className="text-xl font-bold mb-4 text-gray-800">Gợi ý việc làm phù hợp</Text>
      {jobs.map((job) => (
        <TouchableOpacity
          key={job.uuid}
        >
          <JobCard job={job} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
