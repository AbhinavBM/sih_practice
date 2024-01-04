# Importing necessary libraries
from mrjob.job import MRJob
from mrjob.step import MRStep
from datetime import datetime

class UberAnalysis(MRJob):

    # Define the mapper step
    def mapper(self, _, line):
        data = line.split(',')
        dispatching_base_number = data[0].strip()
        date = data[1].strip()
        trips = int(data[3].strip())

        yield (dispatching_base_number, date), trips

    # Define the reducer step
    def reducer(self, key, values):
        total_trips = sum(values)
        yield key, total_trips

    # Define the second mapper step for sorting
    def mapper_sort(self, key, value):
        yield None, (value, key)

    # Define the second reducer step for sorting
    def reducer_sort(self, _, key_values):
        for value, key in sorted(key_values, reverse=True):
            yield key, value

    # Define the steps for the MapReduce job
    def steps(self):
        return [
            MRStep(mapper=self.mapper, reducer=self.reducer),
            MRStep(mapper=self.mapper_sort, reducer=self.reducer_sort)
        ]

if __name__ == '__main__':
    UberAnalysis.run()
