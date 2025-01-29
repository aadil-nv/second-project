// ManagerRepository.ts
import IManagerRepository from "../interface/IManagerReopsitory";
import managerModel from "../../models/managerModel";
import mongoose, { set } from "mongoose";
import { inject, injectable } from "inversify";
import BaseRepository from "./baseRepository";
import {IManager} from "../../entities/managerEntity";
import BusinessOwnerModel from "../../models/businessOwnerModel";
import { IBusinessOwnerDocument } from "../../entities/businessOwnerEntity";

@injectable()
export default class ManagerRepository extends BaseRepository<IManager> implements IManagerRepository {

  constructor(
    @inject("managerModel") private _managerModel: mongoose.Model<IManager>
  ) {
    super(_managerModel);  
  }

  async getAllManagers(businessOwnerId: string): Promise<IManager[]> {
    try {
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
      return await manager.find(); 
    } catch (error) {
      console.error("Error fetching managers:", error);   
      throw error;
    }
  }


  async addManagers(businessOwnerId: string, managerData: IManager): Promise<IManager> {
    try {
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
      const newManager = new manager(managerData);
      return await newManager.save();
    } catch (error) {
      console.error("Error adding manager:", error);
      throw error;
    }
  }


  async findById(id: string): Promise<IBusinessOwnerDocument> {
    try {
      const businessOwnerData = await BusinessOwnerModel.findById(id).exec();
      if (!businessOwnerData) {
        throw new Error(`BusinessOwner with ID ${id} not found`);
      }
      return businessOwnerData;
    } catch (error) {
      console.error("Error finding business owner by ID:", error);
      throw error;
    }
  }


  async findByEmail(businessOwnerId: string, emailId: string): Promise<IManager | null> {
    try {
      if (!emailId || typeof emailId !== 'string') {
        throw new Error("Invalid emailId format");
      }
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
      return manager.findOne({ email: emailId }).exec();
    } catch (error:any) {
      console.error("Error finding manager by email:", error.message);
      throw new Error("Error finding manager by email: " + error.message);
    }
  }

  async blockManager(businessOwnerId: string, managerData: any): Promise<any> {
    try {
      // Log input for debugging
      console.log("BusinessOwnerId:", businessOwnerId);
      console.log("ManagerData:", managerData);
  
      // Switch to the specific database for the business owner
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
  
      // Log to verify database and model setup
      console.log("Using DB:", businessOwnerId);
  
      // Find the manager by email
      const existingManager = await manager.findOne({ email: managerData.email });
  
      if (!existingManager) {
        console.error("Manager not found:", managerData.email);
        throw new Error("Manager not found.");
      }
  
      // Log current status before toggling
      console.log("Current isBlocked status:", existingManager.isBlocked);
  
      // Toggle the isBlocked status
      const newIsBlocked = !existingManager.isBlocked;
  
      // Log new status
      console.log("New isBlocked status:", newIsBlocked);
  
      // Update the isBlocked status in the database
      const updateResult = await manager.updateOne(
        { email: managerData.email },
        { $set: { isBlocked: newIsBlocked } }
      );
      const updatedManager = await managerModel.updateOne({ email: managerData.email },{$set:{ isBlocked: newIsBlocked }});
  
      // Log update result
      console.log("Update result:", updateResult);
  
      return updateResult;
    } catch (error) {
      // Log error for detailed debugging
      console.error("Error toggling manager block status:", error);
      throw error;
    }
  }
  
  async findManagerById(managerId: string, businessOwnerId: string): Promise<IManager |null> {
    try {
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
      return await manager.findById(managerId);

    } catch (error) {
      console.error("Error finding manager by ID:", error);
      throw error;
    }
  }

  async updatePersonalInfo(businessOwnerId: string, managerId: string, data: any): Promise<IManager | null> {
    console.log("Updating manager's personal details with data:", data);
  
    try {
      // Switch to the appropriate business owner's database
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
  
      // Ensure only the specified fields in personalDetails are updated
      const updateData = {
        $set: {
          "personalDetails.managerName": data.fullName,
          "personalDetails.personalWebsite": data.website,
          "personalDetails.email": data.email,
          "personalDetails.phone": data.phone,
        },
      };
  
      // Update the manager document
      const updatedManager = await manager.findByIdAndUpdate(managerId, updateData, { new: true });
  
      if (!updatedManager) {
        console.error("Manager not found");
        return null; // Return null if no manager is found with the provided managerId
      }
  
      return updatedManager; // Return the updated manager document
    } catch (error) {
      console.error("Error updating manager:", error);
      throw error; // Throw the error to be handled by the controller or service layer
    }
  }
  

  async updateProfessionalInfo(businessOwnerId: string, managerId: string, data: any): Promise<IManager | null> {
  
    try {
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
  
      const updateData = {
        professionalDetails: {
          joiningDate: data.dateOfJoin,
          workTime: data.workTime,
          managerType: data.jobTitle,
          salary: data.salary,
        }
      };
  
      const updatedManager = await manager.findByIdAndUpdate(managerId, updateData, { new: true });
      
      if (!updatedManager) {
        console.error("Manager not found");
        return null; 
      }
  
      return updatedManager; 
  
    } catch (error) {
      console.error("Error updating manager:", error);
      throw error;
    }
  }

  async updateAddressInfo(businessOwnerId: string, managerId: string, data: any): Promise<IManager | null> {
    console.log("Updating manager's address details with data:", data);
  
    try {
      // Switch to the appropriate business owner's database
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
  
      // Ensure that only address details are updated
      const updateData = {
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
        }
      };
  
      // Update the address details
      const updatedManager = await manager.findByIdAndUpdate(managerId, updateData, { new: true });
      
      if (!updatedManager) {
        console.error("Manager not found");
        return null; // Return null if no manager is found with the provided managerId
      }
  
      return updatedManager; // Return the updated manager document
  
    } catch (error) {
      console.error("Error updating manager:", error);
      throw error; // Throw the error to be handled by the controller or service layer
    }
  }


  async getDetails(businessOwnerId: string ,managerId : string): Promise<IManager> {
    try {
      const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
      const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
      const result = await this._managerModel.findById(businessOwnerId);
      if (!result) {
        throw new Error(`No business owner found with ID: ${businessOwnerId}`);
      }
      return result;
    } catch (error) {
      console.error("Error getting personal details:", error);
      throw new Error("Could not get personal details.");
    }
  }

  async uploadProfilePic(businessOwnerId: string, filePath: string): Promise<IManager> {
    
    try {
      const result = await this._managerModel.findByIdAndUpdate(
        businessOwnerId,
        { $set: { 'personalDetails.profilePicture': filePath } }, // Save the file path
        { new: true }
      );
  
      if (!result) {
        throw new Error(`No business owner found with ID: ${businessOwnerId}`);
      }
  
      return result;
    } catch (error) {
      console.error('Error updating personal details:', error);
      throw new Error('Could not update personal details.');
    }
  }

 
    async getDashboardData(companyId: string): Promise<any> {
      try {
        // Switch to the correct database using the companyId
        const _switchDb = mongoose.connection.useDb(companyId, { useCache: true });
        const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
    
        // Get the total count of managers
        const totalManagers = await manager.countDocuments();
    
        // Get the count of active managers
        const activeManagers = await manager.countDocuments({ isActive: true });
    
        // Get the count of verified managers
        const verifiedManagers = await manager.countDocuments({ isVerified: true });
    
        // Get the count of blocked managers
        const blockedManagers = await manager.countDocuments({ isBlocked: true });
    
        // Get the count of managers who joined in the last week
        const lastWeekManagers = await manager.countDocuments({
          "professionalDetails.joiningDate": { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
    
        // Get the count of managers who joined in the last month
        const lastMonthManagers = await manager.countDocuments({
          "professionalDetails.joiningDate": { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
    
        // Get the count of managers grouped by the month they joined
        const monthlyJoinData = await manager.aggregate([
          {
            $project: {
              monthJoined: { $month: "$professionalDetails.joiningDate" },
            },
          },
          {
            $group: {
              _id: "$monthJoined",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } }, // Sort by month (ascending)
        ]);
    
        // Return the collected data for the dashboard
        return {
          totalManagers,
          activeManagers,
          verifiedManagers,
          blockedManagers,
          lastWeekManagers,
          lastMonthManagers,
          monthlyJoinData,
        };
      } catch (error) {
        console.error("Error retrieving dashboard data: ", error);
        throw new Error("Failed to fetch dashboard data.");
      }
    }
    
    async updateResume(businessOwnerId: string, managerId: string, documentData: any): Promise<IManager> {
      
      try {
        const _switchDb = mongoose.connection.useDb(businessOwnerId, { useCache: true });
        const manager = _switchDb.model<IManager>('Managers', managerModel.schema);
        const result = await manager.findByIdAndUpdate(managerId, { 
          $set: { 'documents.resume': documentData.documentUrl,
                 "documents.resumeName": documentData.documentName,
                 "documents.resumeSize": documentData.documentSize,
                 "documents.resumeUploadedAt": documentData.uploadedAt,
           } },
           { new: true });
        if (!result) {
          throw new Error(`No manager found with ID: ${managerId}`);
        }
        return result;
      } catch (error) {
        console.error('Error updating resume:', error);
        throw new Error('Could not update resume.');
      }
    }
  
  
}
