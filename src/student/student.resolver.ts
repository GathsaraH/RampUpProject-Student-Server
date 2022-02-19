import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { Response } from 'express';
import * as Joi from '@hapi/joi';
import { HttpStatus, Res } from '@nestjs/common';

@Resolver(() => Student)
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Mutation(() => Student, { name: 'createStudent' })
  async createStudent(
    @Args('createStudentInput') createStudentInput: CreateStudentInput,
    @Res() response: Response,
  ) {
    console.log('createStudentInput', createStudentInput);
    const schema = Joi.object({
      name: Joi.string().required(),
      gender: Joi.string().required(),
      address: Joi.string().required(),
      mobile_no: Joi.string().required(),
      dob: Joi.date().iso(),
    });
    const validation = schema.validate(createStudentInput);
    if (validation.error) {
      response.status(401).send(validation.error);
    } else {
      const studentModal: CreateStudentInput = validation.value;
      try {
        const student = await this.studentService.create(studentModal);
        if (student) {
          // response.status(201).send({
          //   statusCode: HttpStatus.OK,
          //   message: 'Student created successfully',
          //   student,
          // });
          return student;
        }
      } catch (error) {
        console.log(error);
        response.status(401).send(error);
      }
    }
  }

  @Query(() => [Student], { name: 'getAllStudent' })
  async findAll() {
    try {
      return await this.studentService.findAll();
    } catch (error) {
      console.log(error);
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Student not found',
        error,
      };
    }
  }

  @Query(() => [Student], { name: 'student' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.studentService.findOne(id);
  }

  @Mutation(() => Student)
  updateStudent(
    @Args('updateStudentInput') updateStudentInput: UpdateStudentInput,
  ) {
    return this.studentService.update(
      updateStudentInput.id,
      updateStudentInput,
    );
  }

  @Mutation(() => Student)
  removeStudent(@Args('id', { type: () => Int }) id: number) {
    return this.studentService.remove(id);
  }
}
